<template>
  <div>
    <lr-box title="北向资金(亿元)">
      <lr-chart ref="northChart" :height="0.5" />
    </lr-box>
    <lr-box title="南向资金(亿元)">
      <lr-chart ref="southChart" :height="0.5" />
    </lr-box>
  </div>

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
      this.$http.get(`/api/stock/capital/hotMoney`, {
        date: this.formatDate(this.date)
      }).then(result => {
        // 生成数据
        this.renderChart('northChart', this.getChartData('s2n', result), [
          '沪股通',
          '深股通',
          '北向资金'
        ])

        this.renderChart('southChart', this.getChartData('n2s', result), [
          '港股通(沪)',
          '港股通(深)',
          '南向资金'
        ])
      }).catch(_ => {
        console.error(_)
      })
    },
    getChartData(key, response) {
      const result = []
      let date_string = this.$moment(this.date).format('MM-DD')
      if (date_string !== response[`${key}Date`]) {
        return result
      }
      response[key].forEach(_item => {
        let item = _item.split(',')

        function getLastResult(val) {
          val = Number(val)
          return Number((val / 10000).toFixed(2))
        }
        let huAmount = getLastResult(item[1])
        let shenAmount = getLastResult(item[3])
        let totalAmount = Number((huAmount + shenAmount).toFixed(2))
        let time = this.appendDate(item[0])
        result.push({
          time,
          type: "0",
          value: huAmount
        })
        result.push({
          time,
          type: "1",
          value: shenAmount
        })
        result.push({
          time,
          type: '2',
          value: totalAmount
        })
      })

      return result
    },
    appendDate(timePoint) { // 补齐日期格式
      return `2019-06-19 ${ timePoint }:00`
    },
    renderChart(vueReference, chartData, legend) {
      const chart = this.$refs[vueReference].getChart()
      chart.clear()
      if (chartData.length === 0) {
        return
      }
      const capitalLegend = legend
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
