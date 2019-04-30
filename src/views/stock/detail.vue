<template>
  <div style="overflow: auto">
    <div>
      <lr-box>
        <el-input-number v-model="analyzeModel.dataCount" :step="50" :min="70" />
        <el-button type="primary" @click.stop="downloadExcel">分析</el-button>
        <el-button type="primary" @click.stop="startBash">启动脚本</el-button>
        <search-stock />
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
      <lr-box>
        <div :id="secondChartId"></div>
      </lr-box>
    </div>
  </div>
</template>

<script>
import { idGenerator, deepClone } from '@/utils'
import lodash from 'lodash'
import Stock from '@/utils/stock'
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
      collector: [],
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
  mounted() {

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
      this.collector = []
      this.choiceList = []
      let stockList = this.analyzeModel.codeList
      const needLoadCodeList = stockList.map(item => item.value)

      const requestThread = new RequestThread(needLoadCodeList, _ => this.loadData(_, true))
      requestThread.run()
      requestThread.sync(state => { // 同步状态
        console.log(state)
      })
    },
    loadData(code) {
      if (!code) {
        return
      }
      return Promise.all([
        this.$http.post('/api/stock/detail', { code: code }),
        this.$http.post('/api/stock/base', { symbol: code })
      ]).then(responseList => {
        if (!responseList[0]) {
          throw new Error('找不到该数据')
        }

        const base = responseList[1]
        if (!base.float_shares) {
          base.float_shares = base.total_shares // 基金股票
        }
        let floatShare = base.float_shares
        const stockName = base.name.toUpperCase()
        if (stockName.indexOf('ST') !== -1) {
          throw new Error('不考虑垃圾股')
        }
        if (stockName.indexOf('债') !== -1) {
          throw new Error('跳过债券')
        }

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
    downloadExcel() {
      if (this.collector.length === 0) {
        return this.$message.error('没有要导出的数据')
      }

      let collectorData = deepClone(this.collector)
      collectorData.sort((former, later) => {
        return former.diff - later.diff
      })

      const analyzeResult = []
      let targetData = lodash.take(collectorData, this.analyzeModel.recentRecordCount * this.analyzeModel.maxOutputStockCount)
      targetData.forEach(item => {
        if (!analyzeResult.find(existItem => item.code === existItem.code)) {
          if (analyzeResult.length < this.analyzeModel.maxOutputStockCount) {
            analyzeResult.push(item)
          }
        }
      })

      this.choiceList = analyzeResult.map(item => {
        return {
          label: `(${ item.diff })${ item.name }`,
          value: item.code
        }
      })
    },
    analyze({ source, base }) {
      const stock = new Stock(base, source)
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
