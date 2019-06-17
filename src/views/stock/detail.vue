<template>
  <div style="overflow: auto">
    <div>
      <lr-box>
        <el-input-number v-model="analyzeModel.dataCount" :step="50" :min="70" :max="historyDataCount" />
        <el-button :loading="batchAnalyzeLoading" type="primary" @click.stop="startBash(true)">全量分析</el-button>
        <el-button :loading="batchAnalyzeLoading" type="primary" @click.stop="startBash(false)">快速分析</el-button>
        <el-button type="primary" @click.stop="startProbabilityModel">概率模型</el-button>
        <search-stock v-model="stockCode" ref="searchStock" @change="searchStock"/>
        <el-date-picker v-model="targetDate" type="date" :editable="false" placeholder="复盘日期" />
        <el-date-picker v-model="lastDatePoint" type="date" :editable="false" placeholder="最后数据点" />
        <el-button @click.stop="openYearReport">年报</el-button>
        <el-button @click.stop="refresh">刷新</el-button>
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
      </lr-box>
      <lr-box style="margin-top: 8px" v-show="choiceList.length > 0">
        <el-tag class="lr-stock-tag" size="medium" closable @close="removeChoice(itemIndex)" v-for="(item, itemIndex) of choiceList" :key="itemIndex" @click.stop="analyzeChoice(item.value)">{{ item.label }}</el-tag>
      </lr-box>
      <make-short-table />
      <trade-volume-chart ref="tradeVolumeChart" />
      <base-chart ref="baseChart" />
      <template v-if="stockCode && analyzeModel.base && analyzeModel.base.company">
        <lr-box>
          <el-form label-width="100px">
            <el-form-item label="公司简介" style="color: rgba(0, 0, 0, 0.65);font-size: 14px">
              {{ analyzeModel.base.company.org_cn_introduction || '-' }}
            </el-form-item>
            <el-form-item label="主营业务" style="color: rgba(0, 0, 0, 0.65);font-size: 14px">
              {{ analyzeModel.base.company.main_operation_business || '-' }}
            </el-form-item>
            <el-form-item label="省份" style="color: rgba(0, 0, 0, 0.65);font-size: 14px">
              {{ analyzeModel.base.company.provincial_name || '-' }}
            </el-form-item>
          </el-form>
        </lr-box>
      </template>
    </div>
  </div>
</template>

<script>
import { idGenerator, deepClone } from '@/utils'
import lodash from 'lodash'
import Stock from '@/utils/stock'
import { RANGE_END_IN_DAYS } from '@/utils/stock'
import stockUtils from '@/utils/stockUtils'
import RequestThread from '@/utils/RequestThread'
import baseChart from './chart/base.vue'
import tradeVolumeChart from './chart/tradeVolume.vue'
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
    searchStock,
    makeShortTable,
//    simulateDate
  },
  data() {
    return {
      stockCode: '',
      batchAnalyzeLoading: false,
      stockMap: new Map(),
      baseMap: new Map(),
      useChart: true,
      historyDataCount: 420,
      targetDate: new Date(), // 模拟N日前的数据
      lastDatePoint: '',
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
        historyTradeDateRange: 120,
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
      this.refresh()
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
    refresh() {
      this.$nextTick(_ => {
        this.searchStock(this.stockCode)
      })
    },
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
          this.$nextTick(_ => {
            setTimeout(_ => {
                this.batchAnalyzeLoading = false
              // 以365个自然日计算，四个效果差不多。误差为0时，匹配率为80%, 为0.4时，达到90%
              // 聚合上证指数
//              this.simulateIndexMatchRate(result, 'SH000001')
              // 聚合深证成指
//              this.simulateIndexMatchRate(result, 'SZ399001')
              // 聚合沪深300
//              this.simulateIndexMatchRate(result, 'SH000300')
              // 聚合上证50
//              this.simulateIndexMatchRate(result, 'SH000016')
              return

              this.$store.dispatch('updateData', {
                key: 'marketHeat',
                data: stockUtils.calculateMarketTrendPercentage(this.stockMap, 100)
              })

              this.calculateLowPriceStock()
            }, 300)
          })
        }
      })

      requestThread.run()
    },
    getTradeDateList() { // 获取交易日期列表
      return new Promise((resolve, reject) => {
        this.$http.get('api/stock/index', {
          code: 'SH000001',
          count: this.historyDataCount
        }).then(response => {
          const timestampIndex = response.column.indexOf('timestamp')
          const lastDays = this.analyzeModel.historyTradeDateRange
          const lastDataList = lodash.takeRight(response.data, lastDays)
          const result = lastDataList.map(item => {
            return item[timestampIndex]
          })
          resolve(result)
        }).catch(_ => {
          reject(_)
        })
      })
    },
    simulateIndexMatchRate(stockHistoryResult, code) { // testCase 模拟大盘指数匹配率
      this.$http.get('/api/stock/index', {
        code,
        count: this.historyDataCount
      }).then(response => {
        const timestampIndex = response.column.indexOf('timestamp')
        const percentIndex = response.column.indexOf('percent')
        const result = []
        result.push(['code', code])
        for(let i=0; i< 20; i++) {
          const matchDate = []
          const notMatchDate = []
          const errorMargin = i * 0.1 // 误差范围
          stockHistoryResult.forEach(resultItem => {
            const indexItem = response.data.find(item => stockUtils.dateFormat(item[timestampIndex]) === resultItem.dateString)
            if (resultItem.makeShortCount >= resultItem.makeLongCount && indexItem[percentIndex] <= errorMargin) {
              matchDate.push(resultItem.dateString)
            } else if (resultItem.makeLongCount >= resultItem.makeShortCount && indexItem[percentIndex] >= -1 * errorMargin) {
              matchDate.push(resultItem.dateString)
            } else {
              notMatchDate.push(resultItem.dateString)
            }
          })
          result.push([
            `error margin: ${ lodash.round(errorMargin, 1) }`,
            `${ lodash.round(matchDate.length / (matchDate.length + notMatchDate.length) * 100 ,1)}%`
          ])
        }
        console.log(result)
      }).catch(_ => {
        console.error(_)
      })
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

        this.formatData(responseList[0])
        let data = responseList[0].data
        if (data.length < this.historyDataCount / 2) {
          throw new Error('数据不足')
        }
        data.forEach(item => {
          item.waterFrequencyPercent = lodash.round(item.volume / floatShare * 100, 2)
        })
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

      Object.assign(this.analyzeModel, {
        base: stock.base,
        title: stock.base.name
      })

      if (forceUpdate || this.useChart) {
        this.$refs.baseChart.updateChart({
          stock,
          dataCount,
          lastDatePoint: this.lastDatePoint
        })
        this.$refs.tradeVolumeChart.updateChart({
          stock,
          dataCount,
          lastDatePoint: this.lastDatePoint
        })
      }
    },
    calculateLowPriceStock() { // 计算低价股票
      this.getTradeDateList().then(tradeDateList => {
        const result = []
        tradeDateList.forEach(tradeDate => {
          const dateString = stockUtils.dateFormat(tradeDate)
          const analyzeResult = this.analyzeProbability({
            targetDate: new Date(tradeDate)
          })
          result.push({
            date: dateString,
            fivePercentCount: analyzeResult.filter(item => item.targetDate === dateString && item.closeIncrement <= 5).length,
            tenPercentCount: analyzeResult.filter(item => item.targetDate === dateString && item.closeIncrement <= 10).length
          })
        })

        this.$store.dispatch('updateData', {
          key: 'lowPriceCount',
          data: result
        })
      })
    },
    startProbabilityModel() {
      this.$bus.$emit('analyzeMakeShort', this.analyzeProbability({
        targetDate: this.targetDate
      }))
    },
    getTargetStockResultRange(stock, beforeDays = 0) {
      return lodash.slice(stock.result, 0, stock.result.length - beforeDays)
    },
    getTargetStockResultMinValueInRecentDays(stockResult, days = 60) {
      const recentCalculateItemList = lodash.takeRight(stockResult, days)
      const minCloseList = recentCalculateItemList.map(item => item.close)
      return lodash.min(minCloseList)
    },
    analyzeProbability({ targetDate }) {
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
        // 已复盘至指定日期
        let days = RANGE_END_IN_DAYS
        let recentCalculateItemList = lodash.takeRight(targetStockResult, days)
        if (recentCalculateItemList.length === days) {
          const today = recentCalculateItemList[recentCalculateItemList.length - 1]
          // 复盘
          const newTargetStockResultList = lodash.takeRight(this.getTargetStockResultRange(stock, 0), beforeDays)
          let mostRecentDay = newTargetStockResultList[newTargetStockResultList.length - 1]
          if (!mostRecentDay) { // 修复对当日复盘时的异常数据点
            mostRecentDay = {
              close: today.close
            }
          }

          const secondPhaseResult = this.calculateSecondPhaseResult(lodash.takeRight(targetStockResult, 45))
          const model = {
            code: stock.code,
            name: stock.name,
            targetDate: today.date,
            profit: lodash.round((mostRecentDay.close - today.close) / today.close * 100, 1),
            lastDiff: today.diff,
            close: today.close,
            minClose: this.getTargetStockResultMinValueInRecentDays(targetStockResult),
            recentItemList: deepClone(recentCalculateItemList),
            secondPhaseResult,
            secondPhaseCount: secondPhaseResult.length
          }
          if (secondPhaseResult.length > 0) {
            model.bounceRate = secondPhaseResult[secondPhaseResult.length - 1].bounceRate
          }
          model.closeIncrement = lodash.round((model.close / model.minClose - 1) * 100)
          collector.push(model)
        }
      }
      return collector
    },
    calculateSecondPhaseResult(data) {
      const simplifiedTrendData = this.simplifySecondPhaseTrendData(data)
      return this.calculateSecondPhaseGraphProbability(simplifiedTrendData)
    },
    simplifySecondPhaseTrendData(data) { // 简化趋势模型
      const result = []
      for (let i=0; i<data.length; i++) {
        let current = null
        if (i === 0 || i === data.length -1) {
          current = data[i].close
        } else {
          let avgList = [
            data[i - 1].close,
            data[i].close,
            data[i + 1].close
          ]
          current = lodash.mean(avgList)
        }
        result.push({
          date: data[i].date,
          close: current
        })
      }
      return result
    },
    calculateSecondPhaseGraphProbability(arr) { // 判断数据点是否符合二阶段
      /*
       * 1. 找到找到所有可能的极小值
       * 2. 找到极小值之后，不跌的点的个数
       * 3. 确定整个不跌的区间
       * 4. 通过不跌的区间，判断前后是否都是下跌趋势
       * 5. 判断是否存在一个二阶段
       */
      const ABOVE_TEMP_MIN_COUNT = 5 // 之后大于极小值的个数

      // 收集所有的极小值
      const TEMP_MIN_POSITION = []
      for(let i=0; i<arr.length; i++) {
        if (i > 0 && i< arr.length - 1) {
          if (arr[i].close <= arr[i - 1].close && arr[i].close <= arr[i + 1].close) {
            TEMP_MIN_POSITION.push(i)
          }
        }
      }

      // 找到满足大于指定个极小值个数的位置
      let VALID_MIN_POSITION = []
      TEMP_MIN_POSITION.forEach(tempMinPosition => {
        let biggerThanTempMinItem = []
        for (let i=tempMinPosition + 1; i<arr.length; i++) {
          if (arr[i].close >= arr[tempMinPosition].close * 0.98) { // 0.98提高容错率
            biggerThanTempMinItem.push(arr[i])
          } else {
            break
          }
        }
        const biggerThanTempMinCount = biggerThanTempMinItem.length

        if (biggerThanTempMinCount >= ABOVE_TEMP_MIN_COUNT) {
          // 计算弹性方差,使用百分比
          const targetData = arr[tempMinPosition]
          const bounceRateList = biggerThanTempMinItem.map(item => {
            // 需要放大振幅，获取比例去计算
            const amplitude = (item.close - targetData.close) / targetData.close * 100

            return Math.pow(amplitude, 2)
          })

          const variance = lodash.mean(bounceRateList)
          const bounceRate = lodash.round(Math.sqrt(variance), 2)

          VALID_MIN_POSITION.push({
            startDate: targetData.date,
            offsetEndDate: arr[tempMinPosition + biggerThanTempMinCount].date,
            offsetEndClose: arr[tempMinPosition + biggerThanTempMinCount].close,
            vibrateCount: biggerThanTempMinCount,
            startClose: targetData.close,
            bounceRate,
            start: tempMinPosition,
            offset: biggerThanTempMinCount
          })
        }
      })

      // 只保留最新的区间
      VALID_MIN_POSITION.sort((former, later) => {
        return (later.start + later.offset) - (former.start + former.offset)
      })
      if (VALID_MIN_POSITION.length > 1) {
        VALID_MIN_POSITION = [VALID_MIN_POSITION[0]]
      }

      const secondPhaseGraph = []

      // 计算非下跌区间之前最大和之后的最大累计跌幅
      VALID_MIN_POSITION.forEach(validMinPosition => {
        // 区间之前的最高点
        let beforeRangeMaxValue = lodash.max(arr.filter((item, itemIndex) => itemIndex < validMinPosition.start).map(item => item.close))
        // 计算区间之后的最低点
        let afterRangeMinValue = lodash.min(arr.filter((item, itemIndex) => itemIndex > validMinPosition.start + validMinPosition.offset).map(item => item.close))
        // 符合二阶段的点必须前后都大于5个点

        const beforeRangeFallPercent = (validMinPosition.startClose - beforeRangeMaxValue) / beforeRangeMaxValue * 100
        const afterRangeFallPercent = (afterRangeMinValue - validMinPosition.startClose) / validMinPosition.startClose * 100
        const totalFallPercent = beforeRangeFallPercent + afterRangeFallPercent

        // 暂时不考虑第三段 (afterRangeFallPercent <= -5)
        if (beforeRangeFallPercent <= -15 ) {
          secondPhaseGraph.push(Object.assign({
            beforeRangeFallPercent,
            afterRangeFallPercent,
            totalFallPercent
          }, validMinPosition))
        }
      })
      return secondPhaseGraph
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
