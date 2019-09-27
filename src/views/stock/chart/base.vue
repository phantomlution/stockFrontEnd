<template>
  <lr-box :title="title" v-show="stock">
    <div :id="chartId"></div>
  </lr-box>
</template>

<script>
import { idGenerator } from '@/utils'
import lodash from 'lodash'
import G2 from '@antv/g2'

export default {
  data() {
    return {
      title: '',
      stock: null,
      chart: null,
      chartId: idGenerator.next()
    }
  },
  methods: {
    updateChart({stock, dataCount, lastDatePoint}) {
      this.stock = stock
      let rawData = stock.rawData
      if (lastDatePoint) {
        rawData = rawData.filter(item => item.timestamp <= lastDatePoint.getTime())
      }
      const data = lodash.takeRight(rawData, dataCount)
      this.title = stock.label
      const closeValueList = data.map(item => item.close)
      const waterList = data.map(item => item.turnoverRate).filter(item => item !== null)

      const turnoverRate = lodash.round(lodash.mean(waterList), 2)
      const average = lodash.round(lodash.mean(closeValueList), 2)

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

      var scale = {
        timestamp: {
          alias: '日期',
          type: 'time',
          mask: 'YYYY-MM-DD'
        },
        close: {
          alias: 'close',
          min: 0
        },
        turnoverRate: {
          alias: 'turnoverRate',
          formatter: function formatter(value) {
            return value
          }
        },
      };
      var view1 = chart.view();
      view1.source(data, scale);
      view1.line().position('timestamp*close').tooltip('timestamp*close*percent').color('#4FAAEB').size(2);
      view1.line().position('timestamp*turnoverRate').color('#9AD681').size(2);

      view1.guide().line({
        start: {
          timestamp: 'min',
          turnoverRate: turnoverRate
        },
        end: {
          timestamp: 'max',
          turnoverRate: turnoverRate
        },
        text: {
          content: `${ turnoverRate }%`
        }
      })

      view1.guide().line({
        start: {
          timestamp: 'min',
          close: average
        },
        end: {
          timestamp: 'max',
          close: average
        },
        text: {
          content: average
        }
      })

      chart.render();
    }
  }
}
</script>
