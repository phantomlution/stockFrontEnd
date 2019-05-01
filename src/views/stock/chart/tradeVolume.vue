<template>
  <lr-box>
    <div :id="chartId"></div>
  </lr-box>
</template>

<script>
import { idGenerator } from '@/utils'
import lodash from 'lodash'
import G2 from '@antv/g2'

const THRESHOLD_WATER_PERCENT = 50

export default {
  data() {
    return {
      chart: null,
      chartId: idGenerator.next()
    }
  },
  methods: {
    updateChart(stock, dataCount) {
      const data = lodash.takeRight(stock.result, dataCount)
      if (this.chart) {
        this.chart.clear()
      } else {
        this.chart = new G2.Chart({
          container: this.chartId,
          forceFit: true,
          height: window.innerHeight
        })
      }
      const chart = this.chart
      var scale = {
        timestamp: {
          alias: '日期',
          type: 'time',
          mask: 'YYYY-MM-DD'
        },
      }

      chart.source(data, scale);
      chart.tooltip({
        crosshairs: {
          type: 'line'
        }
      });
      chart.line().position('timestamp*diff').tooltip('timestamp*diff*last10*last70');
      chart.point().position('timestamp*diff').size(4).shape('circle').style({
        stroke: '#fff',
        lineWidth: 1
      });
      chart.guide().line({
        start: {
          timestamp: 'min',
          diff: -1 * THRESHOLD_WATER_PERCENT
        },
        end: {
          timestamp: 'max',
          diff: -1 * THRESHOLD_WATER_PERCENT
        },
        text: {
          position: 'start',
          content: `-${ THRESHOLD_WATER_PERCENT }%`
        }
      })
      chart.render();
    },
  }
}
</script>
