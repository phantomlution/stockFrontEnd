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
      console.log(data)
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
      const view = chart.view()
      var scale = {
        timestamp: {
          alias: '日期',
          type: 'time',
          mask: 'YYYY-MM-DD'
        }
      }

      view.source(data, scale);
      view.line().position('timestamp*close').color('isMakeShort', isMakeShort => {
        if (isMakeShort) {
          return 'red'
        } else {
          return '#4FAAEB'
        }
      }).tooltip('timestamp*close*percent').size(2);
      view.line().position('timestamp*diff').color('#9AD681').tooltip('timestamp*diff*lastStartDuration*lastEndDuration');
      view.guide().line({
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
