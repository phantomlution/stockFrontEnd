<template>
  <lr-box :title="title">
    <div :id="chartId"></div>
  </lr-box>

</template>

<script>
import { idGenerator } from '@/utils'
import G2 from '@antv/g2'
import lodash from 'lodash'

export default {
  data() {
    return {
      chart: null,
      chartId: idGenerator.next()
    }
  },
  computed: {
    title() {
      return `交易热度与做空，做多数概览`
    }
  },
  mounted() {
    this.updateChart(this.$store.state.data.marketHeat)
  },
  beforeDestroy() {
    // TODO destroy
  },
  methods: {
    updateChart(data) {
      if (this.chart) {
        this.chart.clear()
      } else {
        this.chart = new G2.Chart({
          container: this.chartId,
          forceFit: true,
          width: window.innerWidth,
          height: window.innerHeight / 2,
          padding: [20, 80, 80, 80]
        })
      }
      const chart = this.chart
      var scale = {
        date: {
          alias: '日期',
          type: 'time',
          mask: 'YYYY-MM-DD'
        },
      }

      const chartData = []

      const positiveTrendData = data.map(item => {
        return {
          date: item.date,
          type: 'positiveTrend',
          value: item.positiveCount
        }
      })

      const makeShortData = data.map(item => {
        return {
          date: item.date,
          type: 'makeShort',
          value: item.makeShortCount
        }
      })

      const makeLongData = data.map(item => {
        return {
          date: item.date,
          type: 'makeLong',
          value: item.makeLongCount
        }
      })

      Array.prototype.push.apply(chartData, positiveTrendData)
      Array.prototype.push.apply(chartData, makeShortData)
      Array.prototype.push.apply(chartData, makeLongData)

      chart.source(chartData, scale);
      chart.tooltip({
        crosshairs: {
          type: 'line'
        }
      });
      chart.line().position('date*value').color('type');
      chart.render()
    }
  }
}
</script>
