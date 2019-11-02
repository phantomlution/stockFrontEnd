<template>
  <lr-box title="大盘资金流向">
    <lr-chart ref="chart" :height="0.5" />
  </lr-box>
</template>

<script>
import lodash from 'lodash'
import moment from 'moment'
import { addStockDailyCoordinate, STOCK_COORDINATE_DATE } from '@/utils/ChartUtils'

const props = {
  date: {
    type: String,
    required: true
  }
}

export default {
  props,
  mounted() {
    this.loadData()
  },
  watch: {
    date() {
      this.loadData()
    }
  },
  computed: {
    chart() {
      return this.$refs.chart.getChart()
    }
  },
  methods: {
    formatDate(date) {
      return moment(date).format('YYYY-MM-DD')
    },
    loadData() {
      if (!this.date) {
        return
      }
      this.$http.get(`/api/stock/capital/flow`, {
        date: this.formatDate(this.date)
      }).then(result => {
        // 生成数据
        const chartData = []
        if (result) {
          result.data['xa'].split(',').forEach((timePoint, timeIndex) => {
            if (timePoint) { // 多出了一个空数据
              result.data['ya'][timeIndex].split(',').forEach((amount, amountIndex) => {
                chartData.push({
                  time: this.appendDate(timePoint),
                  type: amountIndex + '',
                  value: Number(amount)
                })
              })
            }
          })
        }
        this.renderChart(chartData)
      }).catch(_ => {
        console.error(_)
      })
    },
    appendDate(timePoint) { // 补齐日期格式
      return `${ STOCK_COORDINATE_DATE } ${ timePoint }:00`
    },
    renderChart(chartData) {
      const chart = this.$refs.chart.getChart()
      if (chartData.length === 0) {
        return
      }
      const capitalLegend = [
        '主力净流入',
        '超大单净流入',
        '大单净流入',
        '中单净流入',
        '小单净流入'
      ]
      chart.source(chartData)
      chart.scale('type', {
        formatter: function(val) {
          return capitalLegend[val]
        }
      })

      addStockDailyCoordinate(chart)

      chart.line().position('time*value').color('type')
      chart.render()
    }
  }
}
</script>
