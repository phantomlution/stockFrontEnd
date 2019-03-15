<template>
  <div style="height: 100vh">
    <div>
      <div>
        <el-input-number v-model="analyzeModel.dataCount" :step="50" :min="70" />
      </div>
      <div>
        <div :id="chartId"></div>
      </div>
    </div>
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
      chartId: idGenerator.next(),
      analyzeModel: {
        code: 'SZ000007',
        dataCount: 70,
        base: null,
        source: []
      }
    }
  },
  watch: {
    'analyzeModel.dataCount'(val) {
      this.analyze()
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
      const code = this.analyzeModel.code
      Promise.all([
        this.$http.post('/api/stock/detail', { code: code }),
        this.$http.post('/api/stock/base', { symbol: code })
      ]).then(responseList => {
        let floatShare = responseList[1].float_shares
        this.analyzeModel.base = responseList[1]
        let data = responseList[0].data
        data.forEach(item => {
          item.waterFrequencyPercent = lodash.round(item.volume / floatShare * 100, 2)
          if (Math.abs(item.percent) > 10) {
            item.waterFrequencyPercent = null
          }
        })
        this.analyzeModel.source = data
        this.analyze()
      }).catch(_ => {
        console.log(_)
      })
    },
    getBase() {
      return this.analyzeModel.base
    },
    analyze() {
      let data = lodash.takeRight(this.analyzeModel.source, this.analyzeModel.dataCount)
      const closeValueList = data.map(item => item.close)
      const waterList = data.map(item => item.waterFrequencyPercent).filter(item => item !== null)

      const waterFrequencyPercent = lodash.round(lodash.mean(waterList), 2)
      const average = lodash.round(lodash.mean(closeValueList), 2)
      const base = this.getBase()
      const waterFrequentCapitalScale = lodash.round(waterFrequencyPercent / 100 * base.float_shares * average /10000 / 10000, 2)
      console.log(waterFrequentCapitalScale)

      const guide = {
        average,
        waterFrequencyPercent,
        waterFrequentCapitalScale
      }
      this.updateChart(data, guide)
    },
    updateChart(data, { waterFrequencyPercent, average }) {
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
