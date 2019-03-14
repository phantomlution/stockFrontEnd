<template>
  <div style="height: 100vh">
    <div :id="chartId"></div>
  </div>
</template>

<script>
import G2 from '@antv/g2'
import { idGenerator } from '@/utils'
import lodash from 'lodash'

export default {
  data() {
    return {
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

    this.loadData()
  },
  methods: {
    loadData() {
      const code = 'SH600519'
      Promise.all([
        this.$http.post('/api/stock/detail', { code: code }),
        this.$http.post('/api/stock/base', { symbol: code })
      ]).then(responseList => {
        console.log(responseList)
        let floatShare = responseList[1].float_shares
        let data = responseList[0].data
        data.forEach(item => {
          item.waterFrequencyPercent = item.volume / floatShare * 100
          if (Math.abs(item.percent) > 10) {
            item.waterFrequencyPercent = null
          }
        })
        data = lodash.takeRight(data, 100)
        const waterList = data.map(item => item.waterFrequencyPercent).filter(item => item !== null)
        console.log(lodash.mean(waterList))
        // TODO 加条辅助线被，在木牛流马那

      this.updateChart(data)
      }).catch(_ => {
        console.log(_)
      })
    },
    updateChart(data) {
      const chart = this.chart
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
//      chart.tooltip.view()
      chart.render();
    }
  }
}
</script>
