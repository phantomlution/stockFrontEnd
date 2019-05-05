<template>
  <div style="overflow: auto">
    <div>
      <lr-box>
        <el-input-number v-model="analyzeModel.dataCount" :step="50" :min="70" :max="historyDataCount" />
        <el-button type="primary" @click.stop="startBash(true)">全量分析</el-button>
        <el-button type="primary" @click.stop="startBash(false)">快速分析</el-button>
        <el-button type="primary" @click.stop="startProbabilityModel">概率模型</el-button>
        <search-stock v-model="stockCode" ref="searchStock" @change="searchStock"/>
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
      <make-short-table />
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
import makeShortTable from './table/makeShortTable.vue'

const fieldSet = new Set([
  'amount',
  'chg',
  'close',
  'high',
  'low',
  'market_capital',
  'open',
  'percent',
  'timestamp',
  'volume'
])


export default {
  components: {
    baseChart,
    tradeVolumeChart,
    marketHeat,
    searchStock,
    makeShortTable
  },
  data() {
    return {
      stockCode: '',
      stockMap: new Map(),
      baseMap: new Map(),
      useChart: true,
      historyDataCount: 420,
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
      this.$nextTick(_ => {
        this.searchStock(this.stockCode)
      })
    }
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
  mounted() {
    stockUtils.getCodeList().then(({ codeList, baseList }) => {
      this.baseMap.clear()
      baseList.forEach(item => {
        this.baseMap.set(item.symbol, item)
      })
      this.$refs.searchStock.doInit(codeList)

    }).catch(_ => {
      console.error(_)
    })
    this.$bus.$on('searchStockDetail', ({ code }) => {
      this.searchStock(code)
    })
  },
  beforeDestroy() {
    this.$bus.$off('searchStockDetail')
  },
  methods: {
    searchStock(code) {
      this.loadData(code, true)
    },
    analyzeChoice(code) {
      this.analyzeModel.code = code
    },
    removeChoice(index) {
      this.choiceList.splice(index, 1)
    },
    updateProgress(model) {
      Object.assign(this.progress, model)
    },
    startBash(full = false) {
      let stockList = this.$refs.searchStock.stockList

      // 测试集
      if (!full) { // 快速分析
        stockList = stockList.filter((item, itemIndex) => itemIndex <= 100)
      }

      const needLoadCodeList = stockList.map(item => item.value)

      const requestThread = new RequestThread(needLoadCodeList, _ => this.loadData(_, false))

      this.useChart = false
      this.stockMap.clear()
      requestThread.on({
        sync: state => { // 同步状态
          this.updateProgress(state)
        },
        done: state => { // 任务结束
          this.updateProgress(state)
          this.useChart = true
          this.$nextTick(_ => {
            setTimeout(_ => {
              const result = stockUtils.calculateMarketHalfPassivePercent(this.stockMap, 365 * 2)
              this.$refs.marketHeat.updateChart(result)
            }, 0)
          })
        }
      })

      requestThread.run()
    },
    formatData(stockDetail) {
      const dataList = stockDetail.data.map(item => {
        let model = Object.create(null)
        for(let i=0; i<stockDetail.column.length; i++) {
          let column = stockDetail.column[i]
          if (fieldSet.has(column)) {
            model[column] = item[i]
          }
        }
        return model
      })
      stockDetail.data = null
      stockDetail.data = dataList
    },
    getStockDetailRequest(code) {
      const data = { code: code, count: this.historyDataCount }
//      return this.$http.post('/api/stock/detail', data)
      return this.$http.socket('stockDetail', data)
    },
    loadData(code, forceUpdate = false) {
      if (!code) {
        return Promise.reject('code is empty')
      }

      if (this.stockMap.has(code)) { // 缓存中读取数据
        const stock = this.stockMap.get(code)
        this.updateStockInfo(stock, forceUpdate)
        return Promise.resolve()
      }

      return Promise.all([
        this.getStockDetailRequest(code)
      ]).then(responseList => {
        const base = this.baseMap.get(code)

        if (!responseList[0] || !base) {
          throw new Error('找不到该数据')
        }

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
        this.formatData(responseList[0])
        let data = responseList[0].data
        data.forEach(item => {
          item.waterFrequencyPercent = lodash.round(item.volume / floatShare * 100, 2)
          if (Math.abs(item.percent) > 10) {
            item.waterFrequencyPercent = null
          }
        })
        analyzeModel.title = base.name
        Object.assign(this.analyzeModel, analyzeModel)
        this.analyze(data, base, forceUpdate)
      }).catch(_ => {
        console.log(_)
      })
    },
    analyze(source, base, forceUpdate) {
      const stock = new Stock(base, source)
      this.stockMap.set(base.symbol, stock)
      this.updateStockInfo(stock, forceUpdate)
    },
    updateStockInfo(stock, forceUpdate) {
      const dataCount = this.analyzeModel.dataCount
      if (forceUpdate || this.useChart) {
        this.$refs.baseChart.updateChart(stock, dataCount)
        this.$refs.tradeVolumeChart.updateChart(stock, dataCount)
      }
    },
    startProbabilityModel() {
      const collector = []
      for(let stock of this.stockMap.values()) {
        let days = 10
        let recentCalculateItemList = lodash.takeRight(stock.result, days)
        if (recentCalculateItemList.length === days) {
          let makeShortResult = {
            lastResult: false,
            makeShort: 0,
            makeLong: 0
          }
          for(let i=recentCalculateItemList.length - 1; i>= 0; i--) {
            let result = recentCalculateItemList[i].isMakeShort
            if (makeShortResult.lastResult && !result) {
              break
            }
            if (result) {
              makeShortResult.makeShort++
            } else {
              makeShortResult.makeLong++
            }
            makeShortResult.lastResult = result
          }
          if (makeShortResult.makeShort > 0) {
            collector.push({
              code: stock.code,
              name: stock.name,
              makeShort: makeShortResult.makeShort,
              makeLong: makeShortResult.makeLong
            })
          }
        }
      }
      this.$bus.$emit('analyzeMakeShort', collector)
    }
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
