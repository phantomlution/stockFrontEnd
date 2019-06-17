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
      chartId: idGenerator.next(),
      dataCount: 0
    }
  },
  mounted() {
    this.updateChart(this.$store.state.data.lowPriceCount)
  },
  computed: {
    title() {
      if (this.dataCount === 0) {
        return ''
      }
      return `近${ this.dataCount }个交易日价格`
    }
  },
  beforeDestroy() {
    this.$bus.$off('analyzeLowPriceCount')
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
      this.dataCount = data.length
      var scale = {
        date: {
          alias: '日期',
          type: 'time',
          mask: 'YYYY-MM-DD'
        },
      }

      const chartData = []

      const fivePercentCount = data.map(item => {
        return {
          date: item.date,
          type: 'fivePercentCount',
          value: item.fivePercentCount
        }
      })


      const tenPercentCount = data.map(item => {
        return {
          date: item.date,
          type: 'tenPercentCount',
          value: item.tenPercentCount
        }
      })

      Array.prototype.push.apply(chartData, fivePercentCount)
      Array.prototype.push.apply(chartData, tenPercentCount)

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
