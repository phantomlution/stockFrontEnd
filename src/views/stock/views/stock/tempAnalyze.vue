<!-- 做一些临时分析 -->
<template>
  <lr-box>
    <div slot="title">
      <span>{{ code }}, {{ currentDate }}</span>
      <el-button @click.stop="analyze">拉高出货分析</el-button>
      <el-button @click.stop="predict(1)">成交量预测前一天</el-button>
      <el-button @click.stop="predict(-1)">成交量预测后一天</el-button>
      <el-button @click.stop="batchPredict">批量分析</el-button>
    </div>
    <div>
      <lr-chart ref="chart" />
    </div>
  </lr-box>
</template>

<script>
import lodash from 'lodash'
import deepClone from '@/utils'

const minute_in_milli_seconds = 60 * 1000

// 中场休息时间
const intermission = 90 * minute_in_milli_seconds

const props = {
  code: String,
  default: ''
}

export default {
  props,
  data() {
    return {
      diff: 0,
      currentDate: ''
    }
  },
  methods: {
    getVirtualDatetime(time) { // 消除午盘间隔，使数据连续
      const hour = time.substring(0, 2)
      const datetime = this.$moment(`2019-12-21 ${ time }`).toDate().getTime()
      if (Number(hour) >= 12) {
        return datetime - intermission
      } else {
        return datetime
      }
    },
    virtualTimeToReal(milliseconds) {
      const middleDatetime = this.getVirtualDatetime('13:00:00')
      if (milliseconds > middleDatetime) {
        milliseconds += intermission
      }
      return this.$moment(new Date(milliseconds)).format('HH:mm:ss')
    },
    getStockItem() {
      const code = this.code
      return this.$store.state.data.stockMap.get(code)
    },
    getDiffPercent(start, end) {
      return lodash.round((start - end) / end * 100, 2)
    },
    getTotalAmount(list) {
      return lodash.sum(list.map(item => item.amount))
    },
    batchPredict() {
      const arr = Array(100).fill(0)
      Promise.all(
        arr.map((item, itemIndex) => this.getPredictResult(itemIndex))
      ).then(_ => {
        const dataList = []
        _.forEach(predictItem => {
          const time = '14:00:00'
          const currentTimePredict = predictItem.result.find(item => item.real === time)

          const realModel = {
            type: 'real',
            date: predictItem.date,
            value: currentTimePredict.realDiffPercent
          }
          const predictModel = {
            type: 'predict',
            date: predictItem.date,
            value: currentTimePredict.predictDiffPercent
          }
          if (realModel.value * predictModel.value < 0) {
            if (Math.abs(realModel.value - predictModel.value) > 20) { // 20个点 的差距，影响不大
              dataList.push(realModel)
              dataList.push(predictModel)
            }
          }
        })

        console.log({
          negative: dataList.length / 2,
          total: arr.length
        })

        const chart = this.$refs.chart.getChart()
        chart.source(dataList)

        chart.line().position('date*value').color('type')
        chart.render()
      }).catch(_ => {
        console.error(_)
      })
    },
    getPredictResult(diff) { // 从最后一个位置向前偏移个数
      return new Promise((resolve, reject) => {
        const stock = this.getStockItem()

        const dataList = stock.result

        if (diff > dataList.length - 2) {
          return reject('数据越界')
        }

        const startDate = dataList[dataList.length - 1 - diff].date
        const startIndex = dataList.findIndex(item => item.date === startDate)
        const formerIndex = startIndex - 1

        const currentDate = dataList[startIndex].date

        const lastDate = dataList[formerIndex].date

        Promise.all([
          this.getFragmentData(lastDate),
          this.getFragmentData(currentDate)
        ]).then(_ => {
          const lastFragmentData = _[0].data
          const currentFragmentData = _[1].data

          // 生成计算时间点
          // 暂时跳过9：25和9：30
          const minDatetime = this.getVirtualDatetime('09:30:00')
          const maxDatetime = this.getVirtualDatetime('15:01:00')
          const virtualDatetimeList = []
          let start = minDatetime
          while(start <= maxDatetime) {
            virtualDatetimeList.push({
              virtual: start,
              real: this.virtualTimeToReal(start)
            })
            start += 15 * minute_in_milli_seconds
          }

          // 计算昨天的成交总量
          const yesterdayTotalAmount = this.getTotalAmount(lastFragmentData)
          const yesterdayClose = lastFragmentData[lastFragmentData.length - 1].price
          const todayTotalAmount = this.getTotalAmount(currentFragmentData)
          const result = []

          virtualDatetimeList.forEach(virtualDatetimeItem => {
            const yesterdayPartList = lastFragmentData.filter(item => item.virtualDatetime <= virtualDatetimeItem.virtual)
            const todayPartList = currentFragmentData.filter(item => item.virtualDatetime <= virtualDatetimeItem.virtual)

            const predictAmount = lodash.round(yesterdayTotalAmount * this.getTotalAmount(todayPartList) / this.getTotalAmount(yesterdayPartList), 0)

            const realDiffPercent = this.getDiffPercent(todayTotalAmount, yesterdayTotalAmount)
            const predictDiffPercent = this.getDiffPercent(predictAmount, yesterdayTotalAmount)

            result.push({
              index: result.length + 1,
              ...virtualDatetimeItem,
              predictAmount,
              realDiffPercent,
              predictDiffPercent,
              yesterdayTotalAmount,
              todayTotalAmount
            })
          })

          resolve({
            date: currentDate,
            result: result
          })
        }).catch(_ => {
          reject(_)
        })
      }).catch(_ => {
        reject(_)
      })
    },
    predict(diff) {
      if ((this.diff + diff) >= 0) {
        this.diff = this.diff + diff
      } else {
        return
      }

      this.getPredictResult(this.diff).then(({date, result}) => {
        this.currentDate = date

        const chart = this.$refs.chart.getChart()
        chart.source(result)
        chart.line().position('index*predictDiffPercent').tooltip('real*predictDiffPercent*realDiffPercent')

        const realDiffPercent = result[0].realDiffPercent

        chart.guide().line({
          start: {
            index: 'min',
            predictDiffPercent: realDiffPercent
          },
          end: {
            index: 'max',
            predictDiffPercent: realDiffPercent
          },
          text: {
            position: 'end',
            content: `${ realDiffPercent }%`
          }
        })

        chart.render()
      })
    },
    getFragmentData(date) {
      const code = this.code
      return new Promise((resolve, reject) => {
        this.$http.get('/api/analyze/history/fragment/trade', {
          code,
          date
        }).then(_ => {
          _.forEach(fragment => {
            fragment.virtualDatetime = this.getVirtualDatetime(fragment.time)
          })
          resolve({
            date,
            data: _
          })
        }).catch(_ => {
          reject(_)
        })
      })
    },
    analyze() {
      const stock = this.getStockItem()
      const dataList = lodash.takeRight(stock.result, 150)

      Promise.all(dataList.map(item => this.getFragmentData(item.date))).then(responseList => {
        const dataMap = new Map()
        responseList.forEach(responseItem => {
          dataMap.set(responseItem.date, responseItem.data)
        })
        this.analyzeData(dataList, dataMap, stock.result)
        console.log('done')
      }).catch(_ => {
        console.error(_)
      })
    },
    analyzeData(dataList, fragmentDataMap, rawDataList) {
      dataList.forEach(data => {
        const date = data.date
        const fragmentData = fragmentDataMap.get(date)
        if (!fragmentData) {
          console.error('数据错误')
        }
        this.analyzeSurgeForShort(data, fragmentData, rawDataList)
      })
    },
    analyzeSurgeForShort(data, fragmentData, rawDataList) {
      const startDatetime = this.getVirtualDatetime('10:00:00')

      // 过滤出早盘之后的数据
      const filterFragmentData = fragmentData.filter(item => item.virtualDatetime >= startDatetime)

      // 找出最高点
      const maxPriceItem = lodash.maxBy(filterFragmentData, function(item){ return item.price })
      const closePriceItem = fragmentData[fragmentData.length - 1]

      // 判断是否拉高, (计算最高点之前的半小时内的差值)
      const beforeMaxPriceItem = fragmentData.filter(item => {
        return item.virtualDatetime >= (maxPriceItem.virtualDatetime - 30 * minute_in_milli_seconds) && item.virtualDatetime < maxPriceItem.virtualDatetime
      })
      const beforeMaxPriceItemMinItem = lodash.minBy(beforeMaxPriceItem, function(item){ return item.price })
      const surgePercent = lodash.round((maxPriceItem.price - beforeMaxPriceItemMinItem.price) / data.yesterdayClose * 100, 2)
      const slumpPercent = lodash.round((maxPriceItem.price - closePriceItem.price) / data.yesterdayClose * 100 ,2)
      const diffPercent = lodash.round((data.close - data.yesterdayClose) / data.yesterdayClose * 100, 2)

      const model = {
        date: data.date,
        peakTime: maxPriceItem.time,
        surgePercent,
        slumpPercent,
        diffPercent
      }

      if (surgePercent > 3 && slumpPercent > 2) { // 冲高回落
        if (Math.abs(diffPercent) <= 2) { // ? 日内三阶段。。。
          // 计算获利盘
          const incrementItem = this.calculateMaxProfitIncrement(data.date, rawDataList)
          if (incrementItem.incrementPercent > 10) {
            console.warn('【Bad】拉高出货')
            console.log(incrementItem)
          } else {
            console.warn('【Good】加热阶段')
            console.log(incrementItem)
          }

        }
        console.log(model)
      }
    },
    calculateMaxProfitIncrement(date, rawDataList) { // 计算获利盘
      const beforeDataList = rawDataList.filter(item => item.date <= date)
      const dataCount = 30 // 按照一个多月计算
      const filterBeforeDataList = lodash.takeRight(beforeDataList, dataCount)

      const incrementList = []
      for(let i=filterBeforeDataList.length - 1; i> 0; i--) {
        const increment = filterBeforeDataList[i].close - filterBeforeDataList[i - 1].close
        incrementList.push(increment)
      }
      // 计算从第0项开始，整个集合的最大增量是多少
      let maxIncrement = 0
      let maxIncrementIndex = -1
      for (let i=1; i<= incrementList.length; i++) {
        const sum = lodash.sum(lodash.take(incrementList, i))
        if (sum > maxIncrement) {
          maxIncrement = sum
          maxIncrementIndex = i
        }
      }

      // 推倒出达到最大增量的日期，以及当天到现在的涨幅
      if (maxIncrementIndex === -1) {
        return null
      } else {
        const targetItem = filterBeforeDataList[filterBeforeDataList.length - 1 - maxIncrementIndex]
        const todayItem = filterBeforeDataList[filterBeforeDataList.length - 1]
        const incrementPercent = lodash.round((todayItem.close - targetItem.close) / todayItem.close * 100, 2)
        return {
          date: targetItem.date,
          incrementPercent
        }
      }
    }
  }
}
</script>
