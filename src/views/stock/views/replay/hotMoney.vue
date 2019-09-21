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
        const northChartData = []
        const southChartData = []
        if (result) {
          // 生成北向资金数据
          result['s2n'].forEach(_item => {
            let item = _item.split(',')
            /**
             s2n: 北向资金
               0. 时间点
               1. 沪股通流入金额
               2. 沪股通余额
               3. 深股通流入金额
               4. 深股通余额
             */
            function getLastResult(val) {
              val = Number(val)

              return Number((val / 10000).toFixed(2))
            }
            let huAmount = getLastResult(item[1])
            let shenAmount = getLastResult(item[3])
            let totalAmount = Number((huAmount + shenAmount).toFixed(2))
            let time = this.appendDate(item[0])
            northChartData.push({
              time,
              type: "0",
              value: huAmount
            })
            northChartData.push({
              time,
              type: "1",
              value: shenAmount
            })
            northChartData.push({
              time,
              type: '2',
              value: totalAmount
            })
          })

          // 生成南向资金数据
          result['n2s'].forEach(_item => {
            let item = _item.split(',')
            /**
             n2s: 南向资金
             0. 时间点
             1. 港股通(沪)流入金额
             2. 港股通(沪)余额
             3. 港股通(深)流入金额
             4. 港股通(深)余额
             */
            function getLastResult(val) {
              val = Number(val)

              return Number((val / 10000).toFixed(2))
            }
            let huAmount = getLastResult(item[1])
            let shenAmount = getLastResult(item[3])
            let totalAmount = Number((huAmount + shenAmount).toFixed(2))
            let time = this.appendDate(item[0])
            southChartData.push({
              time,
              type: "0",
              value: huAmount
            })
            southChartData.push({
              time,
              type: "1",
              value: shenAmount
            })
            southChartData.push({
              time,
              type: '2',
              value: totalAmount
            })
          })
        }

        this.renderChart('northChart', northChartData, [
          '沪股通',
          '深股通',
          '北向资金'
        ])

        this.renderChart('southChart', southChartData, [
          '港股通(沪)',
          '港股通(深)',
          '南向资金'
        ])
      }).catch(_ => {
        console.error(_)
      })
    },

    appendDate(timePoint) { // 补齐日期格式
      return `2019-06-19 ${ timePoint }:00`
    },
    renderChart(vueReference, chartData, legend) {
      const chart = this.$refs[vueReference].getChart()
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
