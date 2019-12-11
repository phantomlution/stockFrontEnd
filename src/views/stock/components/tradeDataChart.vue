<template>
  <lr-box>
    <div slot="title">
      <lr-stock-detail-link :add="showAdd" :code="code" :name="name" />
    </div>
    <el-input-number v-model="dataCount" :step="50" :min="70" :max="maxDataCount" slot="center"/>
    <lr-chart ref="amountChart" />
  </lr-box>
</template>

<script>
import lodash from 'lodash'

const props = {
  code: {
    type: String,
    default: ''
  },
  autoUpdate: { // 跟随code 更新
    type: Boolean,
    default: true
  },
  showAdd: {
    type: Boolean,
    default: false
  }
}
export default {
  props,
  data() {
    return {
      maxDataCount: 420,
      name: '',
      dataCount: 70
    }
  },
  watch: {
    code(val) {
      if (this.autoUpdate) {
        this.updateChart()
      }
    },
    dataCount() {
      this.updateChart()
    }
  },
  mounted() {
    this.updateChart()
  },
  methods: {
    updateChart() {
      if (!this.code) {
        return
      }
      this.$store.dispatch('loadStockData', this.code).then(stock => {
        this.renderTradeAmountChart({
          stock,
          dataCount: this.dataCount
        })
      }).catch(_ => {

      })
    },
    renderTradeAmountChart({ stock, dataCount }) {
      let rawData = stock.rawData
      const data = lodash.takeRight(rawData, dataCount)
      this.code = stock.code
      this.name = stock.name
      const closeValueList = data.map(item => item.close)
      const waterList = data.map(item => item.amountInMillion).filter(item => item !== null)

      const amountInMillion = lodash.round(lodash.mean(waterList), 2)
      const average = lodash.round(lodash.mean(closeValueList), 2)

      const chart = this.$refs.amountChart.getChart()
      chart.clear()

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
        amountInMillion: {
          alias: 'amountInMillion',
          formatter: function formatter(value) {
            return value
          }
        },
      };
      var view1 = chart.view();
      view1.source(data, scale);
      view1.line().position('timestamp*close').tooltip('timestamp*close*percent').color('#4FAAEB').size(2);
      view1.line().position('timestamp*amountInMillion').color('#9AD681').size(2);

      view1.guide().line({
        start: {
          timestamp: 'min',
          amountInMillion: amountInMillion
        },
        end: {
          timestamp: 'max',
          amountInMillion: amountInMillion
        },
        text: {
          content: `${ amountInMillion } M`
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

      chart.render()
    }
  }
}
</script>
