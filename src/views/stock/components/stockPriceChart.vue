<template>
  <div>
    <lr-chart ref="chart" :height="height" :legend="false" :reUse="false" />
  </div>
</template>

<script>
import { addStockDailyCoordinate, STOCK_COORDINATE_DATE } from '@/utils/ChartUtils'
import { increment, getStockColor } from '@/utils'
import lodash from 'lodash'

const props = {
  height: {
    Number
  }
}

export default {
  props,
  methods: {
    getChart() {
      return this.$refs.chart.getChart()
    },
    updateChart(itemList, close) {
      const chart =this.getChart()

      const dataList = itemList.map(item => {
        return {
          time: `${ STOCK_COORDINATE_DATE } ${ item.time }`,
          value: !item.price ? item.price : Number(item.price)
        }
      })

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

      const maxItemIncrement = Math.abs(maxItem.value - close)
      const minItemIncrement = Math.abs(minItem.value - close)

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
