<template>
  <div>
    <lr-chart ref="chart" :padding="padding" :height="height" :legend="false" :reUse="false" @dblclick="dblclick"/>
  </div>
</template>

<script>
import { addStockDailyCoordinate, STOCK_COORDINATE_DATE, generateTooltip } from '@/utils/ChartUtils'
import { increment, getStockColor, getStringByteLength } from '@/utils'
import lodash from 'lodash'

const props = {
  height: {
    Number
  },
  lightMode: {
    type: Boolean,
    default: false
  },
  padding: {
    type: Array
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
      if (itemList.length === 0) {
        this.$message.warning('暂无数据')
        return
      }

      const dataList = itemList.map(item => {
        return {
          time: `${ STOCK_COORDINATE_DATE } ${ item.time }`,
          value: !item.price ? null : Number(item.price),
          amount: item.amount,
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

      chart.source(dataList, {
        value: {
          ticks: tickList,
          max: lodash.max(tickList),
          min: lodash.min(tickList),
        }
      })

      this.addChartAssistantElement(chart, preClose, tickList, dataList, unit)

      chart.area().position('time*amount').color('#64b5f6').tooltip(false)

      chart.line().position('time*value').tooltip('value*increment*amount')

      chart.render()
    },
    addChartAssistantElement(chart, preClose, tickList, dataList, unit) { // 添加辅助元素
      const chartRef = this.$refs.chart

      chart.axis('value', {
        position: 'left',
        label: {
          htmlTemplate: value => {
            const color = getStockColor(value - preClose)
            const str = `${ Number(value).toFixed(2) }${unit}`

            return `<span style="font-size: 13px;margin-left: -${getStringByteLength(str) * 7}px;color:${ color }">${ str }</span>`
          }
        },
      })

      chart.legend(false)
      chart.axis('amount', false)

      chart.tooltip({
        crosshairs: {
          type: 'cross'
        },
        useHtml: true,
        htmlContent: (title, items) => {
          const itemList = []
          items.forEach(item => {
            const name = item.name
            let value = item.value
            if (name === 'value') {
              itemList.push({
                name: '价格',
                value: `${value}${unit}`,
                color: getStockColor(value - preClose)
              })
              const change = lodash.round(value - preClose, 2)
              itemList.push({
                name: '较昨收',
                value: `${ change }${unit}`,
                color: getStockColor(change)
              })
            } else if (name === 'increment') {
              itemList.push({
                name: '涨跌幅',
                value: `${value}%`,
                color: getStockColor(value)
              })
            } else if (name === 'amount') {
              if (value > 1000 * 10000) {
                value = `${ lodash.round(value / 10000 / 10000, 2)}亿`
              } else {
                value = `${ lodash.round(value / 10000, 2)}万`
              }

              itemList.push({
                name: '成交量',
                value
              })
            }
          })

          return generateTooltip(title, itemList)
        }
      })

      // 添加右侧辅助线
      tickList.forEach(tick => {
        chart.guide().text({
          top: true,
          position: { time: 'max', value: tick },
          content: `${ Number(increment(tick, preClose)).toFixed(2) }%`,
          style: {
            fill: getStockColor(tick - preClose)
          },
          offsetX: 10
        })
      })

      // 绘制最后收盘价的辅助线
      const validPointList = dataList.filter(item => item.value)

      if (validPointList.length > 0) {
        const closeValue = validPointList[validPointList.length - 1].value
        chartRef.addAssistantLine(chart,{
          start: { time: 'min', value: closeValue },
          end: { time: 'max', value: closeValue }
        })
      }

      // 横坐标辅助线
      addStockDailyCoordinate(chart, this.lightMode)
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
    },
    dblclick(data) {
      this.$emit('dblclick', data)
    }
  }

}
</script>
