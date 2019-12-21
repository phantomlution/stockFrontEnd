<template>
  <lr-box>
    <div slot="title">
      <lr-stock-detail-link :add="showAdd" :code="code" :name="name" />
      <el-button @click.stop="analyze">拉高出货分析</el-button>
      <span style="display: inline-block; font-size: 14px;margin-left: 8px">
        近一个月成交额: {{ average }} million
      </span>
    </div>
    <el-input-number slot="center" v-model="dataCount" :step="50" :min="70" :max="maxDataCount" />
    <lr-chart ref="chart" />
  </lr-box>
</template>

<script>
import lodash from 'lodash'
import moment from 'moment'

const THRESHOLD_WATER_PERCENT = 50

const props = {
  code: {
    type: String,
    default: ''
  },
  showAdd: {
    type: Boolean,
    default: false
  },
  config: {
    type: Object
  }
}
export default {
  props,
  data() {
    return {
      dataCount: 70,
      maxDataCount: 420,
      name: '',
      average: ''
    }
  },
  watch: {
    code() {
      this.updateChart()
    },
    dataCount() {
      this.updateChart()
    }
  },
  mounted() {
    this.updateChart()
  },
  methods: {
    updateChart() {
      if (!this.code) {
        return
      }
      this.$store.dispatch('loadStockData', this.code).then(stock => {
        this.renderChart({
          stock,
          dataCount: this.dataCount
        })
      }).catch(_ => {

      })
    },
    calculateAmount(data) {
      this.average = ''
      const recentDataList = lodash.takeRight(data, 30)
      // 计算最近一个自然月的平均成交量
      const average = lodash.round(lodash.mean(recentDataList.map(item => item.amountInMillion)), 2)
      this.average = average
    },
    renderChart({stock, dataCount}) {
      let rawData = stock.result
      this.stock = stock
      this.code = stock.code
      this.name = stock.name
      const data = lodash.takeRight(rawData, dataCount)
      this.calculateAmount(data)

      const chart = this.$refs.chart.getChart()

      const view = chart.view()
      var scale = {
        timestamp: {
          alias: '日期',
          type: 'time',
          mask: 'YYYY-MM-DD'
        }
      }

      view.source(data, scale);
      view.line().position('timestamp*close').color('#4FAAEB').tooltip('close*percent').size(2);
      view.line().position('timestamp*diff').color('#9AD681').tooltip('amountInMillion*diff');

      // 追加限售解禁信息
      const restrict_sell_list = stock.base.restrict_sell_list || []
      restrict_sell_list.forEach(item => {
        view.guide().line({
          start: [item.timestamp, 'min'], // 使用数组格式
          end: [item.timestamp, 'max'],
          text: {
            position: 'end',
            autoRotate: false,
            content: `${ item.date.substring(5) }解禁`
          }
        })
      })

      // 追加高亮点

      const highlight = this.config ? this.config.highlight || [] : []
      highlight.forEach(item => {
        view.guide().line({
          start: [item.timestamp, 'min'], // 使用数组格式
          end: [item.timestamp, 'max'],
          lineStyle: {
            stroke: '#E6A23C',
            lineWidth: 2
          },
          text: {
            position: 'end',
            autoRotate: false,
            content: `${ item.date }当前点`
          }
        });
      })

      for(let i=1; i<data.length; i++) {
        const today = data[i]
        // 添加涨停提示
        if (today.percent >= 9.9) {
          this.addExtraInfoPoint(view, [today.timestamp, today.close], '涨停')
        }

        if (today.isMakeShort) {
          this.addMakeShortPoint(view, [today.timestamp, today.close])
        } else if (today.isMakeLong){
          this.addMakeLongPoint(view, [today.timestamp, today.close])
        }
        const yesterday = data[i - 1]
        if (today.isMakeShort && yesterday.isMakeShort) {
          this.addMakeShortGuideLine(view, [today.timestamp, today.close], [yesterday.timestamp, yesterday.close])
        } else if (today.isMakeLong && yesterday.isMakeLong) {
          this.addMakeLongGuideLine(view, [today.timestamp, today.close], [yesterday.timestamp, yesterday.close])
        }
      }

      view.guide().line({
        start: {
          timestamp: 'min',
          diff: -1 * THRESHOLD_WATER_PERCENT
        },
        end: {
          timestamp: 'max',
          diff: -1 * THRESHOLD_WATER_PERCENT
        },
        text: {
          position: 'start',
          content: `-${ THRESHOLD_WATER_PERCENT }%`
        }
      })

      chart.render()
    },
    addExtraInfoPoint(view, start, text) { // 添加涨停
      view.guide().dataMarker({
        top: false,
        position: start,
        content: text,
        style: {
          point: {
            stroke: 'orange'
          }
        }
      });
    },
    addMakeShortPoint(view, start) {
      view.guide().dataMarker({
        position: start,
        content: '',
        style: {
          point: {
            stroke: 'red'
          }
        }
      })
    },
    addMakeLongPoint(view, start) {
      view.guide().dataMarker({
        position: start,
        content: '',
        style: {
          point: {
            stroke: 'green'
          }
        }
      });
    },
    addMakeShortGuideLine(view, start, end) {
      view.guide().line({
        top: true,
        lineStyle: {
          stroke: '#f00',
          lineDash: [0],
          lineWidth: 3,
        },
        start: start,
        end: end
      })
    },
    addMakeLongGuideLine(view, start, end) {
      view.guide().line({
        top: true,
        lineStyle: {
          stroke: '#0f0',
          lineDash: [0],
          lineWidth: 3,
        },
        start: start,
        end: end
      })
    },
    getFragmentData(date) {
      const code = this.code
      return new Promise((resolve, reject) => {
        this.$http.get('/api/analyze/history/fragment/trade', {
          code: code.substring(2),
          date
        }).then(_ => {
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
      const code = this.code
      const stock = this.$store.state.data.stockMap.get(code)
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
      // 中场休息时间
      const intermission = 90 * 60 * 1000
      fragmentData.forEach(fragment => {
        const hour = fragment.time.substring(0, 2)
        fragment.datetime = this.$moment(`2019-12-21 ${ fragment.time }`).toDate().getTime()
        if (Number(hour) > 12) {
          fragment.virtualDatetime = fragment.datetime - intermission
        } else {
          fragment.virtualDatetime = fragment.datetime
        }
      })

      const startDatetime = this.$moment(`2019-12-21 10:00:00`).toDate().getTime()

      // 过滤出早盘之后的数据
      const filterFragmentData = fragmentData.filter(item => item.datetime >= startDatetime)

      // 找出最高点
      const maxPriceItem = lodash.maxBy(filterFragmentData, function(item){ return item.price })
      const closePriceItem = fragmentData[fragmentData.length - 1]

      // 判断是否拉高, (计算最高点之前的半小时内的差值)
      const beforeMaxPriceItem = fragmentData.filter(item => {
        return item.virtualDatetime >= (maxPriceItem.virtualDatetime - 30 * 60 * 1000) && item.virtualDatetime < maxPriceItem.virtualDatetime
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
