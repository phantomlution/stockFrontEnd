<template>
  <div>
    <lr-chart ref="chart" @dblclick="dblclick" />
  </div>
</template>

<script>
import { increment, getStockColor } from '@/utils'
import { generateTooltip } from '@/utils/ChartUtils'
import lodash from 'lodash'

export default {
  name: 'KLine',
  data() {
    return {
      type: ''
    }
  },
  computed: {
    isConcept() {
      return this.type === 'concept'
    }
  },
  methods: {
    divideByOneHundredMillion(val) { // 除以一亿
      if (!val) {
        return val
      }
      return lodash.round(val / 10000 / 10000, 2)
    },
    parseDataList(rawDataList) {
      const result = rawDataList.map(item => {
        const model = {
          start: item.open,
          end: item.close,
          max: item.max,
          min: item.min,
          volume: item.volume,
          amount: this.divideByOneHundredMillion(item.amount),
          date: item.date,
          yesterdayClose: item.yesterdayClose,
          name: item.name
        }

        model.range = [model.start, model.end, model.max, model.min]
        if (model.end >= model.start) {
          model.trend = '上涨'
        } else {
          model.trend = '下跌'
        }

        if (this.isConcept) {
          model.rank = item.rank
          model.rankWeight = item.rankWeight
        }
        return model
      })

      // 判断是否需要对数据单位进行放大
      let unit = ''
      if (result[0].start >= 1000 * 10000) {
        unit = '亿'
        result.forEach(item => {
          item.start = this.divideByOneHundredMillion(item.start)
          item.end = this.divideByOneHundredMillion(item.end)
          item.max = this.divideByOneHundredMillion(item.max)
          item.min = this.divideByOneHundredMillion(item.min)
          item.yesterdayClose = this.divideByOneHundredMillion(item.yesterdayClose)

          item.range = [item.start, item.end, item.max, item.min]
        })
      }

      this.beautify(result)

      return {
        unit,
        dataList: result
      }
    },
    beautify(dataList) { // 点数过少，左侧坐标轴会被遮挡，左右各补上一个点
      if (dataList.length >= 60) {
        return
      }

      // number | date
      const firstDate = dataList[0].date
      const lastDate = dataList[dataList.length - 1].date
      if (isNaN(firstDate)) { // date
        dataList.unshift({
          date: this.$moment(firstDate).add('days', -1).format('YYYY-MM-DD'),
          range: null
        })
        dataList.push({
          date: this.$moment(lastDate).add('days', 1).format('YYYY-MM-DD'),
          range: null
        })
      } else { // number
        dataList.unshift({
          date: firstDate - 1,
          range: null
        })
        dataList.push({
          date: lastDate + 1,
          range: null
        })
      }

    },
    renderChart(rawDataList, config = {}) {
      const { type, scale, assistantLine = [] } = config
      this.type = type
      const { dataList, unit } = this.parseDataList(rawDataList)

      const chartRef = this.$refs.chart
      const chart = chartRef.getChart()
      chart.source(dataList, {
        date: {
          type: 'timeCat',
          nice: false,
          range: [ 0, 1 ]
        },
        trend: {
          values: ['上涨', '下跌']
        },
        ...scale
      })

      chart.legend(false)
      this.customizeToolTip(chart, unit)

      const kView = chart.view()
      kView.source(dataList)

      // 1. 成交量图
      kView.area().position('date*amount').color('#64b5f6').tooltip(false)
      kView.axis('amount', {
        position: 'right',
        label: {
          formatter: val => {
            return val + '亿'
          }
        }
      })

      // 针对概念板块，还要绘制排行榜
      if (this.isConcept) {
        kView.line().position('date*rankWeight').color('#fbd437').tooltip(false)
        kView.axis('rankWeight', false)
      }

      // 2. K线图
      kView.schema().position('date*range')
        .color('trend', val => {
          if (val === '上涨') {
            return '#f04864';
          }

          if (val === '下跌') {
            return '#2fc25b';
          }
        })
        .shape('candle')
        .tooltip('name*date*start*end*max*min*amount*code*yesterdayClose*rank')


      kView.axis('range', {
          position: 'left',
          label: {
            formatter: val => {
            return val + unit
          }
        }
      })

      // 辅助线
      assistantLine.forEach(assistantItem => {
        chartRef.addAssistantLine(kView, assistantItem.position, assistantItem.content)
      })

      chart.render()
    },
    customizeToolTip(chart, unit) { // 自定义tooltip html
      chart.tooltip({
        crosshairs: {
          type: 'cross'
        },
        useHtml: true,
        htmlContent: (title, items) => {
          const itemList = []
          const yesterdayClose = Number(items.find(item => item.name === 'yesterdayClose').value)
          const todayClose = Number(items.find(item => item.name === 'end').value)

          itemList.push({
            name: '昨收',
            value: `${yesterdayClose}${unit}`
          })
          items.forEach(item => {
            const itemValue = item.value
            if (item.name === 'start') {
              itemList.push({
                name:'开盘',
                value: `${itemValue}${unit}`,
                color: getStockColor(Number(itemValue) - yesterdayClose)
              })
            } else if (item.name === 'end') {
              itemList.push({
                name: '收盘',
                value: `${itemValue}${unit}`,
                color: getStockColor(todayClose - yesterdayClose)
              })
            } else if(item.name === 'max') {
              itemList.push({
                name: '最高',
                value: `${itemValue}${unit}`,
                color: getStockColor(Number(itemValue) - yesterdayClose)
              })
            } else if (item.name === 'min') {
              itemList.push({
                name: '最低',
                value: `${itemValue}${unit}`,
                color: getStockColor(Number(itemValue) - yesterdayClose)
              })
            } else if (item.name === 'amount') {
              itemList.push({ // 计算涨跌幅
                name: '涨跌幅',
                value: `${ increment(todayClose, yesterdayClose) }%`,
                color: getStockColor(todayClose - yesterdayClose)
              })
              if (!itemValue) {
                return
              }
              itemList.push({
                name: '成交额',
                value: `${itemValue}亿`
              })
            } else if (item.name === 'rank') {
              if (!itemValue) {
                return
              }
              itemList.push({
                name: '板块排行',
                value: `${itemValue}`
              })
              console.log()
            }
          })

          const nameItem = items.find(item => item.name === 'name')
          if (nameItem) {
            title = nameItem.value
          }

          return generateTooltip(title, itemList)
        },
      })
    },
    dblclick(model) {
      this.$emit('dblclick', model)
    }
  }
}
</script>
