<template>
  <div style="overflow: auto">
    <div>
      <lr-box>
        <el-input-number v-model="analyzeModel.dataCount" :step="50" :min="70" />
        <el-button type="primary" @click.stop="startBash">启动脚本</el-button>
        <search-stock ref="searchStock" />
        <el-button @click.stop="refresh">刷新</el-button>
      </lr-box>
      <lr-box>
        <el-form label-width="84px">
          <el-form-item label="更新视图">
            <el-switch v-model="useChart" />
          </el-form-item>
        </el-form>
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
import searchStock from './searchStock.vue'

export default {
  components: {
    baseChart,
    tradeVolumeChart,
    searchStock
  },
  data() {
    return {
      stockMap: new Map(),
      useChart: true,
      choiceList: [], // 待选择列表
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
    'analyzeModel.code'() {
      this.refresh()
    }
  },
  methods: {
    analyzeChoice(code) {
      this.analyzeModel.code = code
    },
    refresh() {
      this.loadData(this.analyzeModel.code)
    },
    removeChoice(index) {
      this.choiceList.splice(index, 1)
    },
    startBash() {
      let stockList = this.$refs.searchStock.stockList

      // 测试集
      stockList = stockList.filter((item, itemIndex) => itemIndex <= 1000)

      const needLoadCodeList = stockList.map(item => item.value)

      const requestThread = new RequestThread(needLoadCodeList, _ => this.loadData(_, true))

      requestThread.on({
        sync: state => { // 同步状态

        },
        done: state => { // 任务结束
          const result = stockUtils.calculateMarketHalfPassivePercent(this.stockMap, 100)
          console.log(result)
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
        analyzeModel.source = data

        Object.assign(this.analyzeModel, analyzeModel)
        this.analyze(analyzeModel)
      }).catch(_ => {
        console.log(_)
      })
    },
    analyze({ source, base }) {
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
