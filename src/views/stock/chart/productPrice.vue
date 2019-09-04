<template>
  <lr-box>
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
  methods: {
    updateChart(data) {
      if (this.chart) {
        this.chart.clear()
      } else {
        this.chart = new G2.Chart({
          container: this.chartId,
          forceFit: true,
          width: window.innerWidth,
          height: window.innerHeight * 0.75,
          padding: [20, 80, 80, 80]
        })
      }
      const chart = this.chart

      const chartData = data

      chart.source(chartData);
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
