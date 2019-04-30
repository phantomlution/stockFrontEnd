<template>
  <lr-box :title="title">
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
      chart: null,
      chartId: idGenerator.next()
    }
  },
  mounted() {
    this.chart = new G2.Chart({
      container: this.chartId,
      forceFit: true,
      width: window.innerWidth,
      height: window.innerHeight,
      padding: [20, 80, 80, 80]
    })
  },
  methods: {
    updateChart(stock, dataCount) {
      const data = lodash.takeRight(stock.rawData, dataCount)
      this.title = stock.name
      const closeValueList = data.map(item => item.close)
      const waterList = data.map(item => item.waterFrequencyPercent).filter(item => item !== null)

      const waterFrequencyPercent = lodash.round(lodash.mean(waterList), 2)
      const average = lodash.round(lodash.mean(closeValueList), 2)

      const chart = this.chart
      chart.clear()
      function pick(data, field) {
        return data.map(function(item) {
          var result = {};
          for (var key in item) {
            if (item.hasOwnProperty(key) && field.indexOf(key) !== -1) {
              result[key] = item[key];
            }
          }
          return result;
        });
      }


      chart.scale({
        volume: {
          sync: true
        }
      });
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
        waterFrequencyPercent: {
          alias: 'waterFrequencyPercent',
          formatter: function formatter(value) {
            return value
          }
        },
      };
      var view1 = chart.view();
      view1.source(pick(data, ['close', 'waterFrequencyPercent', 'timestamp', 'percent']), scale);
      view1.axis('waterFrequencyPercent', {
        grid: null
      });
      view1.line().position('timestamp*close').tooltip('timestamp*close*percent').color('#4FAAEB').size(2);
      view1.line().position('timestamp*waterFrequencyPercent').color('#9AD681').size(2);

      view1.guide().line({
        start: {
          timestamp: 'min',
          waterFrequencyPercent: waterFrequencyPercent
        },
        end: {
          timestamp: 'max',
          waterFrequencyPercent: waterFrequencyPercent
        },
        text: {
          content: `${ waterFrequencyPercent }%`
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
