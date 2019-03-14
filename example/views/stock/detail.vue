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

    // 最后一天的数据不准确
    this.$http.post(`/api/stock/detail`, {
      code: 'SZ000007'
    }).then(response => {
      console.log(response)
      let data = response.data
      console.log(data)
      data = lodash.takeRight(data, 100)
      this.updateChart(data)
    }).catch(_ => {
      console.log(_)

    })
  },
  methods: {
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
        volume: {
          alias: 'volume',
          formatter: function formatter(value) {
            return parseInt(value / 10000 / 100, 10)
          }
        }
      };
      var view1 = chart.view();
      view1.source(pick(data, ['close', 'volume', 'timestamp']), scale);
      view1.axis('volume', {
        grid: null
      });
      view1.line().position('timestamp*close').color('#4FAAEB').size(2);
      view1.line().position('timestamp*volume').color('#9AD681').size(2);
      chart.render();
    }
  }
}
</script>
