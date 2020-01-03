<template>
  <div>
    <lr-chart ref="chart" :height="height" :legend="false" :reUse="false" />
  </div>
</template>

<script>
import { addStockDailyCoordinate, STOCK_COORDINATE_DATE } from '@/utils/ChartUtils'
import { $moment, increment, getStockColor } from '@/utils'
import lodash from 'lodash'
import scheduleMixin, { STOP_CALLBACK_FOR_STOCK } from '@/mixins/schedule'

const props = {
  height: {
    Number
  },
  code: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  yesterdayClose: {
    type: Number,
    default: 7.98
  }
}

// 计算早盘和午盘
const pointList = [];
[`${ STOCK_COORDINATE_DATE} 09:30:00`, `${ STOCK_COORDINATE_DATE } 13:00:00`].forEach(startTime => {
  for (let i=0; i<= 120; i++) {
    pointList.push({
      time: $moment(startTime).add(i, 'minutes').format('YYYY-MM-DD HH:mm:ss'),
      value: null
    })
  }
})

export default {
  props,
  mixins: [scheduleMixin],
  mounted() {
    this.startSchedule(this.loadData, 5, STOP_CALLBACK_FOR_STOCK)
  },
  methods: {
    loadData() {
      this.$http.get(`/api/stock/live`, {
        code: this.code
      }).then(itemList => {
        this.updateChart(itemList)
      })
    },
    updateChart(itemList) {
      const chart = this.$refs.chart.getChart()

      const dataList = itemList.map(item => {
        return {
          time: `${ STOCK_COORDINATE_DATE } ${ item.time }`,
          value: Number(item.price)
        }
      })

      if (dataList.length === 0) {
        Array.prototype.push.apply(dataList, pointList)
      } else {
        Array.prototype.push.apply(dataList, pointList.filter(item => item.time >= dataList[dataList.length - 1].time))
      }

      const close = this.yesterdayClose
      const tickList = this.getTickList(close, dataList)

      chart.source(dataList, this.getChartConfig(close, tickList))
      this.addChartAssistantElement(chart, close, tickList)
      chart.line().position('time*value')

      chart.render()
    },
    addChartAssistantElement(chart, close, tickList) { // 添加辅助元素
      chart.axis('value', {
        label: {
          htmlTemplate: value => {
            const color = getStockColor(value - close)
            return `<span style="font-size: 13px;margin-left: -48px;color:${ color }">${ Number(value).toFixed(2) }</span>`
          }
        },
      })
      tickList.forEach(tick => {
        chart.guide().text({
          top: true,
          position: ['max', tick],
          content: `${ Number(increment(tick, close)).toFixed(2) }%`,
          style: {
            fill: getStockColor(tick - close)
          },
          offsetX: 16
        })
      })

      // 横坐标辅助线
      addStockDailyCoordinate(chart)
    },
    getChartConfig(close, tickList) { // 添加辅助元素
      return {
        value: {
          ticks: tickList,
          max: lodash.max(tickList),
          min: lodash.min(tickList),
        },
        percent: {
          ticks: tickList.map(item => lodash.round((item - close) / close * 100, 2))
        }
      }
    },
    getTickList(close, dataList) { // 计算刻度点
      const maxItem = lodash.maxBy(dataList, item => item.value)
      const minItem = lodash.minBy(dataList, item => item.value)

      const maxItemIncrement = Math.abs(maxItem.value - this.yesterdayClose)
      const minItemIncrement = Math.abs(minItem.value - this.yesterdayClose)

      let maxIncrement = maxItemIncrement
      if (minItemIncrement > maxIncrement) { // 计算最大的偏移值
        maxIncrement = minItemIncrement
      }

      // 根据最大增量，按照昨日收盘价，生成7个刻度。
      const tickList = [close]

      for(let i=1; i<=3; i++) {
        tickList.push(lodash.round(close + maxIncrement * i / 3, 2))
        tickList.push(lodash.round(close - maxIncrement * i / 3, 2))
      }

      return tickList
    }
  }

}
</script>
