<template>
  <div :id="chartId"></div>
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
          height: window.innerHeight,
          padding: [20, 80, 80, 80]
        })
      }
      const chart = this.chart
      chart.clear()
      var scale = {
        date: {
          alias: '日期',
          type: 'time',
          mask: 'YYYY-MM-DD'
        },
      }

      data = data.map(item => {
        return {
          date: item.date,
          percent: lodash.round(100 * item.positiveCount / item.total, 1)
        }
      })

      chart.source(data, scale);
      chart.tooltip({
        crosshairs: {
          type: 'line'
        }
      });
      chart.line().position('date*percent').tooltip('date*percent');
      chart.point().position('date*percent').size(4).shape('circle').style({
        stroke: '#fff',
        lineWidth: 1
      });


      chart.render()
    }
  }
}
</script>
