<template>
  <div>
    <lr-chart ref="chart" @dblclick="dblclick" />
  </div>
</template>

<script>
import { increment, getStockColor } from '@/utils'
import lodash from 'lodash'

export default {
  name: 'KLine',
  methods: {
    divideByOneHundredMillion(val) { // 除以一亿
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
      const { dataList, unit } = this.parseDataList(rawDataList)
      const { scale, assistantLine = [] } = config

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
      this.customizeToolTip(chart)

      const kView = chart.view()
      kView.area().position('date*amount').color('#64b5f6').tooltip(false)
      kView.axis('amount', {
        position: 'right',
        label: {
          formatter: val => {
            return val + '亿'
          }
        }
      })
      kView.axis('range', {
        position: 'left',
        label: {
          formatter: val => {
            return val + unit
          }
        }
      })

      kView.source(dataList)

      kView.schema()
        .position('date*range')
        .color('trend', val => {
          if (val === '上涨') {
            return '#f04864';
          }

          if (val === '下跌') {
            return '#2fc25b';
          }
        })
        .shape('candle')
        .tooltip('name*date*start*end*max*min*amount*code*yesterdayClose')

      // 辅助线
      assistantLine.forEach(assistantItem => {
        chartRef.addAssistantLine(kView, assistantItem.position, assistantItem.content)
      })

      chart.render()
    },
    getItemHtml(name, value, color) {
      return `
        <div class="lr-tooltip__item">
          <div class="lr-tooltip__item--label">${ name }</div>
          <div class="lr-tooltip__item--value" style="color:${color}">${ value }</div>
        </div>`
    },
    customizeToolTip(chart) { // 自定义tooltip html
      chart.tooltip({
        crosshairs: {
          type: 'cross'
        },
        useHtml: true,
        htmlContent: (title, items) => {
          const itemHtmlList = []
          const yesterdayClose = Number(items.find(item => item.name === 'yesterdayClose').value)
          const todayClose = Number(items.find(item => item.name === 'end').value)

          itemHtmlList.push(this.getItemHtml('昨收', yesterdayClose))
          items.forEach(item => {
            const itemValue = item.value
            if (item.name === 'start') {
              itemHtmlList.push(this.getItemHtml('开盘', itemValue, getStockColor(Number(itemValue) - yesterdayClose)))
            } else if (item.name === 'end') {
              itemHtmlList.push(this.getItemHtml('收盘', itemValue, getStockColor(todayClose - yesterdayClose)))
            } else if(item.name === 'max') {
              itemHtmlList.push(this.getItemHtml('最高', itemValue, getStockColor(Number(itemValue) - yesterdayClose)))
            } else if (item.name === 'min') {
              itemHtmlList.push(this.getItemHtml('最低', itemValue, getStockColor(Number(itemValue) - yesterdayClose)))
            } else if (item.name === 'amount') {
              itemHtmlList.push(this.getItemHtml('成交额', `${ itemValue }亿`))
            }
          })
          // 计算涨跌幅
          const diff = increment(todayClose, yesterdayClose)
          itemHtmlList.push(this.getItemHtml('涨跌幅', `${diff}%`, getStockColor(todayClose - yesterdayClose)))

          const nameItem = items.find(item => item.name === 'name')
          if (nameItem) {
            title = nameItem.value
          }

          return `<div class="lr-tooltip" style="position: absolute">
            <div class="lr-tooltip__header">${ title }</div>
              <div>${ itemHtmlList.join('') }</div>
            </div>`;
        },
      })
    },
    dblclick(model) {
      this.$emit('dblclick', model)
    }
  }
}
</script>

<style lang="scss">
.lr-tooltip{
  /*visibility: visible !important;*/
  /*display: block !important;*/
  padding: 8px;
  font-size: 13px;
  background: #FFFFFF;
  border: 1px solid #97c8ff;
}

.lr-tooltip__header{
  text-align: center;
  margin-bottom: 8px;
}

.lr-tooltip__item{
  display: flex;
  width: 100px;
  line-height: 20px;
}

.lr-tooltip__item--label{
  width: 42px;
  color: #b0b0b0;
}

.lr-tooltip__item--value{
  flex: 1;
  text-align: right;
}
</style>
