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
      const view = chart.view()
      var scale = {
        timestamp: {
          alias: '日期',
          type: 'time',
          mask: 'YYYY-MM-DD'
        }
      }

      view.source(data, scale);
      view.line().position('timestamp*close').color('#4FAAEB').tooltip('timestamp*close*percent').size(2);
      view.line().position('timestamp*diff').color('#9AD681').tooltip('timestamp*diff*lastStartDuration*lastEndDuration');

      for(let i=1; i<data.length; i++) {
        const today = data[i]
        const yesterday = data[i - 1]
        if (today.isMakeShort && yesterday.isMakeShort) {
          this.addGuideLine(view, [today.timestamp, today.close], [yesterday.timestamp, yesterday.close])
        }
      }

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
    addGuideLine(view, start, end) {
      view.guide().line({
        top: true,
        lineStyle: {
          stroke: '#f00',
          lineDash: [0],
          lineWidth: 3,
        },
        start: start,
        end: end
      })
    }
  }
}
</script>
