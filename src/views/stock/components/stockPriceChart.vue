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
    divideByOneHundredMillion(val) { // 除以一亿
      return lodash.round(val / 10000 / 10000, 2)
    },
    updateChart(itemList, preClose) {
      const chart = this.$refs.chart.getChart()

      const dataList = itemList.map(item => {
        return {
          time: `${ STOCK_COORDINATE_DATE } ${ item.time }`,
          value: !item.price ? null : Number(item.price),
          increment: !item.price ? null : increment(Number(item.price), preClose)
        }
      })

      // 优化单位
      let unit = ''
      if (dataList[0].value > 100 * 10000) {
        unit = '亿'
        preClose = this.divideByOneHundredMillion(preClose)
        dataList.forEach(item => {
          item.value = this.divideByOneHundredMillion(item.value)
        })
      }

      const tickList = this.getTickList(preClose, dataList)

      chart.source(dataList, this.getChartConfig(preClose, tickList))
      this.addChartAssistantElement(chart, preClose, tickList, dataList, unit)
      chart.line().position('time*value').tooltip('value*increment')

      chart.render()
    },
    addChartAssistantElement(chart, preClose, tickList, dataList, unit) { // 添加辅助元素
      const chartRef = this.$refs.chart

      chart.axis('value', {
        label: {
          htmlTemplate: value => {
            const color = getStockColor(value - preClose)
            return `<span style="font-size: 13px;margin-left: -64px;color:${ color }">${ Number(value).toFixed(2) }${unit}</span>`
          }
        },
      })

      chart.tooltip({
        crosshairs: {
          type: 'cross'
        }
      })

      tickList.forEach(tick => {
        chart.guide().text({
          top: true,
          position: ['max', tick],
          content: `${ Number(increment(tick, preClose)).toFixed(2) }%`,
          style: {
            fill: getStockColor(tick - preClose)
          },
          offsetX: 16
        })
      })

      // 绘制最后收盘价的辅助线
      const validPointList = dataList.filter(item => item.value)

      if (validPointList.length > 0) {
        const closeValue = validPointList[validPointList.length - 1].value
        chartRef.addAssistantLine(chart,{
          start: ['min', closeValue],
          end: ['max', closeValue]
        })
      }

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
