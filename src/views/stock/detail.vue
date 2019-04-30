<template>
  <div style="overflow: auto">
    <div>
      <lr-box>
        <el-input-number v-model="analyzeModel.dataCount" :step="50" :min="70" />
        <el-button type="primary" @click.stop="startBash">启动脚本</el-button>
        <search-stock ref="searchStock" @change="loadData"/>
      </lr-box>
      <lr-box v-if="progress.totalCount">
        <div style="display: flex">
          <div style="flex: 1">
            <el-progress :text-inside="true" :stroke-width="18" :percentage="progressPercent" color="#8e71c7"></el-progress>
          </div>
          <div style="margin-left: 8px;font-size: 14px;color: rgba(0, 0, 0, 0.65)">
            {{ progress.finishCount }}/{{ progress.totalCount}},最大并发{{ progress.requestCount }},耗时{{ progress.seconds | inMinutes }}
          </div>
        </div>
        <market-heat ref="marketHeat" />
      </lr-box>
      <lr-box style="margin-top: 8px" v-show="choiceList.length > 0">
        <el-tag class="lr-stock-tag" size="medium" closable @close="removeChoice(itemIndex)" v-for="(item, itemIndex) of choiceList" :key="itemIndex" @click.stop="analyzeChoice(item.value)">{{ item.label }}</el-tag>
      </lr-box>
      <base-chart ref="baseChart" />
      <trade-volume-chart ref="tradeVolumeChart" />
    </div>
  </div>
</template>

<script>
import { idGenerator, deepClone } from '@/utils'
import lodash from 'lodash'
import Stock from '@/utils/stock'
import stockUtils from '@/utils/stockUtils'
import RequestThread from '@/utils/RequestThread'
import baseChart from './chart/base.vue'
import tradeVolumeChart from './chart/tradeVolume.vue'
import marketHeat from './chart/marketHeat.vue'
import searchStock from './searchStock.vue'

export default {
  components: {
    baseChart,
    tradeVolumeChart,
    marketHeat,
    searchStock
  },
  data() {
    return {
      stockMap: new Map(),
      useChart: true,
      choiceList: [], // 待选择列表
      progress: {
        finishCount: 0,
        totalCount: 0,
        requestCount: 0,
        seconds: 0
      },
      analyzeModel: {
        recentRecordCount: 3,
        maxOutputStockCount: 48,
        codeList: [],
        currentCodeList: [],
        title: '',
        code: '',
        dataCount: 70,
        base: null,
        source: []
      }
    }
  },
  watch: {
    'analyzeModel.dataCount'() {
      this.analyze()
    },
  },
  computed: {
    progressPercent() {
      if (this.progress.totalCount === 0) {
        return 0
      } else {
        return parseInt(this.progress.finishCount / this.progress.totalCount * 100)
      }
    }
  },
  filters: {
    inMinutes(seconds) {
      const minutes = parseInt(seconds / 60)
      const secondsRemainder = seconds % 60
      return `${ minutes > 0 ? minutes + '分' : ''}${ secondsRemainder }秒`
    }
  },
  methods: {
    analyzeChoice(code) {
      this.analyzeModel.code = code
    },
    removeChoice(index) {
      this.choiceList.splice(index, 1)
    },
    updateProgress(model) {
      Object.assign(this.progress, model)
    },
    startBash() {
      let stockList = this.$refs.searchStock.stockList

      // 测试集
//      stockList = stockList.filter((item, itemIndex) => itemIndex <= 100)

      const needLoadCodeList = stockList.map(item => item.value)

      const requestThread = new RequestThread(needLoadCodeList, _ => this.loadData(_, true))

      this.useChart = false
      this.stockMap.clear()
      requestThread.on({
        sync: state => { // 同步状态
          this.updateProgress(state)
        },
        done: state => { // 任务结束
          this.updateProgress(state)
          const result = stockUtils.calculateMarketHalfPassivePercent(this.stockMap, 365 * 2)
          this.$refs.marketHeat.updateChart(result)
          console.log(result)
          this.useChart = true
        }
      })

      requestThread.run()
    },
    loadData(code) {
      if (!code) {
        return
      }
      return Promise.all([
        this.$http.post('/api/stock/detail', { code: code }),
        this.$http.post('/api/stock/base', { symbol: code })
      ]).then(responseList => {
        if (!responseList[0] || !responseList[1]) {
          throw new Error('找不到该数据')
        }

        const base = responseList[1]
        if (!base.float_shares) {
          throw new Error('不考虑非股票产品')
        }
        const stockName = base.name.toUpperCase()
        if (stockName.indexOf('ST') !== -1) {
          throw new Error('不考虑垃圾股')
        }
        if (stockName.indexOf('债') !== -1) {
          throw new Error('跳过债券')
        }
        let floatShare = base.float_shares


        const analyzeModel = {}

        analyzeModel.base = base
        let data = responseList[0].data
        data.forEach(item => {
          item.waterFrequencyPercent = lodash.round(item.volume / floatShare * 100, 2)
          if (Math.abs(item.percent) > 10) {
            item.waterFrequencyPercent = null
          }
        })
        analyzeModel.title = base.name
        Object.assign(this.analyzeModel, analyzeModel)
        this.analyze(data, base)
      }).catch(_ => {
        console.log(_)
      })
    },
    analyze(source, base) {
      const stock = new Stock(base, source)
      this.stockMap.set(base.code, stock)
      const dataCount = this.analyzeModel.dataCount
      if (!this.useChart) {
        return
      }

      this.$refs.baseChart.updateChart(stock, dataCount)
      this.$refs.tradeVolumeChart.updateChart(stock, dataCount)
    },
  }
}
</script>

<style lang="scss">
.lr-stock-tag{
  &:hover{
    cursor: pointer;
  }
}

.el-tag{
  margin-bottom: 8px;
  margin-right: 8px;
}
</style>
