<template>
  <div style="overflow: auto">
    <div>
      <lr-box>
        <el-input-number v-model="analyzeModel.dataCount" :step="50" :min="70" :max="historyDataCount" />
        <el-button :loading="batchAnalyzeLoading" type="primary" @click.stop="startBash(true)">全量分析</el-button>
        <el-button :loading="batchAnalyzeLoading" type="primary" @click.stop="startBash(false)">快速分析</el-button>
        <el-button :loading="probabilityLoading" type="primary" @click.stop="startProbabilityModel">概率模型</el-button>
        <search-stock v-model="stockCode" ref="searchStock" @change="searchStock"/>
        <el-date-picker v-model="targetDate" type="date" :editable="false" placeholder="复盘日期">
        </el-date-picker>
        <el-button @click.stop="openYearReport">年报</el-button>
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
import searchStock from './components/searchStock.vue'
import makeShortTable from './table/makeShortTable.vue'
//import simulateDate from './components/simulateDate.vue'

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
    makeShortTable,
//    simulateDate
  },
  data() {
    return {
      stockCode: '',
      batchAnalyzeLoading: false,
      probabilityLoading: false,
      stockMap: new Map(),
      baseMap: new Map(),
      useChart: true,
      historyDataCount: 420,
      targetDate: new Date(), // 模拟N日前的数据
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
      this.stockCode = code
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
    startBash(full = false) { // 是否是全量数据
      let stockList = this.$refs.searchStock.stockList

      // 测试集
      if (!full) { // 快速分析
        stockList = stockList.filter((item, itemIndex) => itemIndex <= 100)
      }

      const needLoadCodeList = stockList.map(item => item.value)

      const requestThread = new RequestThread(needLoadCodeList, _ => this.loadData(_, false))

      this.useChart = false
      this.stockMap.clear()
      this.batchAnalyzeLoading = true
      requestThread.on({
        sync: state => { // 同步状态
          this.updateProgress(state)
        },
        done: state => { // 任务结束
          this.updateProgress(state)
          this.useChart = true
          this.batchAnalyzeLoading = false
          this.$nextTick(_ => {
            setTimeout(_ => {
              const result = stockUtils.calculateMarketTrendPercentage(this.stockMap, 365)
              // 聚合上证指数
              console.log(result)
              this.$http.get('/api/stock/index', {
                count: this.historyDataCount
              }).then(response => {
                const timestampIndex = response.column.indexOf('timestamp')
                const percentIndex = response.column.indexOf('percent')
                const matchDate = []
                const notMatchDate = []
                result.forEach(resultItem => {
                  const indexItem = response.data.find(item => stockUtils.dateFormat(item[timestampIndex]) === resultItem.dateString)
                  if (resultItem.makeShortCount >= resultItem.makeLongCount && indexItem[percentIndex] <= 0) {
                    matchDate.push(resultItem.dateString)
                  } else if (resultItem.makeLongCount >= resultItem.makeShortCount && indexItem[percentIndex] >= 0) {
                    matchDate.push(resultItem.dateString)
                  } else {
                    notMatchDate.push(resultItem.dateString)
                  }
                })
                console.log(matchDate)
                console.log(notMatchDate)
              }).catch(_ => {
                console.error(_)
              })

              this.$refs.marketHeat.updateChart(result)
            }, 300)
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
      const data = { code: code }
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
        if (data.length < this.historyDataCount) {
          throw new Error('数据不足')
        }
        data.forEach(item => {
          item.waterFrequencyPercent = lodash.round(item.volume / floatShare * 100, 2)
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
      this.probabilityLoading = true
      this.$nextTick(_ => {
        this.$bus.$emit('analyzeMakeShort', this.analyzeMakeShort({
          targetDate: this.targetDate
        }))
//        this.$bus.$emit('analyzeMakeShort', this.analyzeMyIdea())
        this.$nextTick(_ => {
          this.probabilityLoading = false
        })
      })
    },
    getTargetStockResultRange(stock, beforeDays = 0) {
      return lodash.slice(stock.result, 0, stock.result.length - beforeDays)
    },
    getTargetStockResultMinValueInRecentDays(stockResult, days = 180) {
      const recentCalculateItemList = lodash.takeRight(stockResult, days)
      const minCloseList = recentCalculateItemList.map(item => item.close)
      return lodash.min(minCloseList)
    },
    analyzeMakeShort({ targetDate }) {
      const collector = []
      for(let stock of this.stockMap.values()) {
        let beforeDays = -1
        for(let i=0; i<stock.rawData.length; i++) {
          if (stock.rawData[stock.rawData.length - 1 - i].timestamp <= targetDate.getTime()) {
            beforeDays = i
            break
          }
        }
        if (beforeDays === -1) {
          continue
        }

        const targetStockResult = this.getTargetStockResultRange(stock, beforeDays)
        let days = 10
        let recentCalculateItemList = lodash.takeRight(targetStockResult, days)
        if (recentCalculateItemList.length === days) {
          let makeShortResult = {
            lastResult: false,
            makeShort: 0,
            notMakeShort: 0
          }
          for(let i=recentCalculateItemList.length - 1; i>= 0; i--) {
            let currentCalculateItem = recentCalculateItemList[i]
            if (currentCalculateItem.percent <= -9) {
              makeShortResult.floorCount++
            } else if (currentCalculateItem.percent >= 9) {
              makeShortResult.ceilingCount++
            }
            let result = currentCalculateItem.isMakeShort
            if (makeShortResult.lastResult && !result) {
              break
            }
            if (result) {
              makeShortResult.makeShort++
            } else {
              makeShortResult.notMakeShort++
            }
            makeShortResult.lastResult = result
          }
          if (makeShortResult.makeShort > 0) {
            const today = recentCalculateItemList[recentCalculateItemList.length - 1]
            // 复盘
            const newTargetStockResultList = lodash.takeRight(this.getTargetStockResultRange(stock, 0), beforeDays)
            let mostRecentDay = newTargetStockResultList[newTargetStockResultList.length - 1]
            if (!mostRecentDay) { // 修复对当日复盘时的异常数据点
              mostRecentDay = {
                close: today.close
              }
            }
            const model = {
              code: stock.code,
              name: stock.name,
              targetDate: today.date,
              makeShort: makeShortResult.makeShort,
              notMakeShort: makeShortResult.notMakeShort,
              ceilingCount: newTargetStockResultList.filter(item => item.percent > 9).length,
              floorCount: newTargetStockResultList.filter(item => item.percent < -9).length,
              profit: lodash.round((mostRecentDay.close - today.close) / today.close * 100, 1),
              lastDiff: today.diff,
              close: today.close,
              minClose: this.getTargetStockResultMinValueInRecentDays(targetStockResult)
            }

            model.closeIncrement = lodash.round((model.close / model.minClose - 1) * 100)
            if (recentCalculateItemList.length > 3) {
              const yesterday = recentCalculateItemList[recentCalculateItemList.length - 2]
              const theDayBeforeYesterday = recentCalculateItemList[recentCalculateItemList.length - 3]
              model.lastOneDayTrend = lodash.round(today.diff - yesterday.diff, 1)
              model.lastTwoDayTrend = lodash.round(yesterday.diff - theDayBeforeYesterday.diff, 1)
            }
            collector.push(model)
          }
        }
      }
      return collector
    },
    openYearReport() {
      window.open(`https://xueqiu.com/snowman/S/${ this.stockCode }/detail#/ZYCWZB`)
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
