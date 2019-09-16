<template>
  <lr-box :title="title">
    <div slot="right">
      <el-date-picker v-model="date" type="date" placeholder="选择日期" @change="loadData"></el-date-picker>
    </div>
    <div :id="chartId"></div>
  </lr-box>
</template>

<script>
import { idGenerator } from '@/utils'
import G2 from '@antv/g2'
import lodash from 'lodash'
import moment from 'moment'

export default {
  data() {
    return {
      chart: null,
      chartId: idGenerator.next(),
      date: moment().toDate()
    }
  },
  computed: {
    title() {
      return `${ this.formatDate(this.date)  }日资金流向`
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    formatDate(date) {
      return moment(date).format('YYYY-MM-DD')
    },
    loadData() {
      this.$http.get(`/api/stock/capital/flow`, {
        date: this.formatDate(this.date)
      }).then(result => {
        if (!result && this.chart) {
          this.chart.clear()
        }
        // 生成数据
        const chartData = []
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

        this.renderChart(chartData)
      }).catch(_ => {
        console.error(_)
      })
    },
    appendDate(timePoint) {
      return `2019-06-19 ${ timePoint }:00`
    },
    renderChart(chartData) {
      if (this.chart) {
        this.chart.clear()
      } else {
        this.chart = new G2.Chart({
          container: this.chartId,
          forceFit: true,
          width: window.innerWidth,
          height: window.innerHeight * 0.8,
          padding: [20, 80, 80, 80]
        })
      }
      const chart = this.chart
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
