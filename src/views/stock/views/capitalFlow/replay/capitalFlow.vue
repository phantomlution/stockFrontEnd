<template>
  <lr-box title="大盘资金流向">
    <lr-chart ref="chart" :height="0.5" />
  </lr-box>
</template>

<script>
import lodash from 'lodash'
import moment from 'moment'

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
      return `2019-06-19 ${ timePoint }:00`
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
      chart.scale('time', {
        type: 'timeCat',
        ticks: [
          '09:31',
          '10:30',
          '11:30',
          '14:00',
          '15:00'
        ].map(item => this.appendDate(item)).map(item => moment(item).toDate().getTime()),
        formatter: function(val) {
          return moment(val).format('HH:mm')
        }
      })

      chart.line().position('time*value').color('type')
      chart.render()
    }
  }
}
</script>
