<template>
  <lr-box>
    <div slot="title">
      <lr-stock-detail-link :add="showAdd" :code="code" :name="name" />
      <span style="display: inline-block; font-size: 14px;margin-left: 8px">
        近一个月成交额: {{ average }} million
      </span>
      <el-button type="primary" :loading="isLoading" @click.stop="loadSurgeForShort">跌点分析</el-button>
    </div>
    <el-input-number slot="center" v-model="dataCount" :step="50" :min="70" :max="maxDataCount" />
    <lr-chart ref="chart" />
  </lr-box>
</template>

<script>
import lodash from 'lodash'
import moment from 'moment'

const THRESHOLD_WATER_PERCENT = 50

const props = {
  code: {
    type: String,
    default: ''
  },
  showAdd: {
    type: Boolean,
    default: false
  },
  config: {
    type: Object
  }
}
export default {
  props,
  data() {
    return {
      dataCount: 70,
      maxDataCount: 420,
      name: '',
      average: '',
      isLoading: false,
      stock: null
    }
  },
  watch: {
    code() {
      this.updateChart()
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
      this.isLoading = false
      this.$store.dispatch('loadStockData', this.code).then(stock => {
        if (stock !== this.stock) {
          this.stock = stock
        }

        this.renderChart({
          stock,
          dataCount: this.dataCount
        })
      }).catch(_ => {

      })
    },
    loadSurgeForShort() {
      // 同步时的代码
      const code = this.code
      const stock = this.$store.state.data.stockMap.get(code)
      if (this.isLoading) {
        return
      }

      if (code === this.code) {
        this.isLoading = true
        // 分析数据点个数
        const historyItemList = lodash.takeRight(stock.rawData, 200)
        const dateList = historyItemList.map(item => item.date)
        this.$http.put(`/api/analyze/surge_for_short`, {
          code,
          dateList
        }).then(_ => {
          if (code === this.code) {
            stock.surgeForShortList = _.filter(item => !!item.result)
            this.isLoading = false
            this.updateChart()
          }
        }).catch(_ => {
          console.error(_)
          if (code === this.code && stock === this.stock) {
            this.isLoading = false
            this.$message.error('分析失败')
          }
        })
      }
    },
    calculateAmount(data) {
      this.average = ''
      const recentDataList = lodash.takeRight(data, 30)
      // 计算最近一个自然月的平均成交量
      const average = lodash.round(lodash.mean(recentDataList.map(item => item.amountInMillion)), 2)
      this.average = average
    },

    renderChart({stock, dataCount}) {
      let rawData = stock.result
      this.stock = stock
      this.code = stock.code
      this.name = stock.name
      const data = lodash.takeRight(rawData, dataCount)
      this.calculateAmount(data)

      const chartRef = this.$refs.chart
      const chart = chartRef.getChart()

      const view = chart.view()
      var scale = {
        timestamp: {
          alias: '日期',
          type: 'time',
          mask: 'YYYY-MM-DD'
        }
      }

      view.source(data, scale)
      view.line().position('timestamp*close').color('#4FAAEB').tooltip('close*percent').size(2)
      view.line().position('timestamp*diff').color('#9AD681').tooltip('amountInMillion*diff')

      // 拉高出货点
      const surgeForShortList = stock.surgeForShortList || []
      // 追加限售解禁信息
      const restrictSellList = stock.base.restrict_sell_list || []
      // 追加高亮点
      const highlightPointList = this.config ? this.config.highlight || [] : []

      const pointList = []
      Array.prototype.push.apply(pointList, surgeForShortList.map(item => ({ date: item.date, text: '拉高出货' })))
      Array.prototype.push.apply(pointList, restrictSellList.map(item => ({ date: item.date, text: '解禁' })))
      Array.prototype.push.apply(pointList, highlightPointList.map(item => ({ date: item.date, text: '当前点' })))

      const groupResult = lodash.groupBy(pointList, item => item.date)
      Object.keys(groupResult).forEach(date => {
        const position = {
          start: [date, 'min'],
          end: [date, 'max']
        }

        chartRef.addAssistantLine(view, position, groupResult[date].map(item => item.text))
      })

      for(let i=1; i<data.length; i++) {
        const today = data[i]
        // 添加涨停提示
        if (today.percent >= 9.9) {
          this.addExtraInfoPoint(view, [today.timestamp, today.close], '涨停')
        }

        if (today.isMakeShort) {
          this.addMakeShortPoint(view, [today.timestamp, today.close])
        } else if (today.isMakeLong){
          this.addMakeLongPoint(view, [today.timestamp, today.close])
        }
        const yesterday = data[i - 1]
        const position = {
          start: [today.timestamp, today.close],
          end: [yesterday.timestamp, yesterday.close]
        }
        if (today.isMakeShort && yesterday.isMakeShort) {
          chartRef.addAssistantLine(view, position, '', { color: 'red', dash: false })
        } else if (today.isMakeLong && yesterday.isMakeLong) {
          chartRef.addAssistantLine(view, position, '', { color: '#0f0', dash: false })
        }
      }

      chartRef.addAssistantLine(view, {
        start: {
          timestamp: 'min',
          diff: -1 * THRESHOLD_WATER_PERCENT
        },
        end: {
          timestamp: 'max',
          diff: -1 * THRESHOLD_WATER_PERCENT
        }
      }, `-${ THRESHOLD_WATER_PERCENT }%`, {
        horizontal: true,
        textPosition: 'start'
      })


      chart.render()
    },
    addExtraInfoPoint(view, start, text) { // 添加涨停
      view.guide().dataMarker({
        top: false,
        position: start,
        content: text,
        style: {
          point: {
            stroke: 'orange'
          }
        }
      });
    },
    addMakeShortPoint(view, start) {
      view.guide().dataMarker({
        position: start,
        content: '',
        style: {
          point: {
            stroke: 'red'
          }
        }
      })
    },
    addMakeLongPoint(view, start) {
      view.guide().dataMarker({
        position: start,
        content: '',
        style: {
          point: {
            stroke: 'green'
          }
        }
      });
    },
  }
}
</script>
