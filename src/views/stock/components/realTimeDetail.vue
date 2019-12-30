<template>
  <div>
    <lr-chart ref="chart" />
  </div>
</template>

<script>
import { addStockDailyCoordinate, STOCK_COORDINATE_DATE } from '@/utils/ChartUtils'
import { $moment, increment } from '@/utils'
import lodash from 'lodash'

const props = {
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
[`${ STOCK_COORDINATE_DATE} 09:30:00`, `${ STOCK_COORDINATE_DATE } 13:01:00`].forEach(startTime => {
  for (let i=0; i< 120; i++) {
    pointList.push({
      time: $moment(startTime).add(i, 'minutes').format('YYYY-MM-DD HH:mm:ss'),
      value: null
    })
  }
})

export default {
  props,
  mounted() {
    this.loadData()
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

      const maxItem = lodash.maxBy(dataList, item => item.value)
      const minItem = lodash.minBy(dataList, item => item.value)

      const maxItemIncrement = Math.abs(maxItem.value - this.yesterdayClose)
      const minItemIncrement = Math.abs(minItem.value - this.yesterdayClose)

      let maxIncrement = maxItemIncrement
      if (minItemIncrement > maxIncrement) { // 计算最大的偏移值
        maxIncrement = minItemIncrement
      }




      if (dataList.length === 0) {
        Array.prototype.push.apply(dataList, pointList)
      } else {
        Array.prototype.push.apply(dataList, pointList.filter(item => item.time >= dataList[dataList.length - 1].time))
      }
      console.log(dataList)
      const interval = lodash.round(maxIncrement / 3, 2)

      const tickList = [
        8.78,
        8.51,
        8.25,
        7.98,
        7.71,
        7.45,
        7.18
      ]
      const config = {
        value: {
          ticks: tickList,
          max: 8.78,
          min: 7.18,
        },
        percent: {
          ticks: tickList.map(item => lodash.round((item - this.yesterdayClose) / this.yesterdayClose * 100, 2))
        }
      }

      console.warn(config)
      chart.axis('value', {
        label: {
          formatter: val => {
            console.log(val)
            return val + ' gr'; // 格式化坐标轴显示文本
          },
        },
      });
      addStockDailyCoordinate(chart)
      chart.source(dataList, config)
      chart.line().position('time*value')
      tickList.forEach(tick => {
        chart.guide().text({
          top: true,
          position: ['max', tick],
          content: `${ increment(tick, this.yesterdayClose) }%`,
          offsetX: 16
        })
      })

      chart.render()

    }
  }

}
</script>
