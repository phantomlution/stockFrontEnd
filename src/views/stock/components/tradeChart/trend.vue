<template>
  <lr-box>
    <div slot="title">
      <lr-stock-detail-link :add="showAdd" :code="code" :name="name" />
      <span style="display: inline-block; font-size: 14px;margin-left: 8px">
        近一个月成交额: {{ average }} million
      </span>
      <el-button type="primary" :loading="isLoading" @click.stop="loadSurgeForShort">跌点分析</el-button>
    </div>
    <k-line ref="chart" @dblclick="dblclick" />
  </lr-box>
</template>

<script>
import lodash from 'lodash'

const props = {
  code: {
    type: String,
    default: ''
  },
  showAdd: {
    type: Boolean,
    default: true
  }
}
export default {
  props,
  data() {
    return {
      name: '',
      average: '',
      isLoading: false
    }
  },
  watch: {
    code() {
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
      Promise.all([
        this.$store.dispatch('loadStockData', this.code),
      ]).then(stockList => {
        const stock = stockList[0]

        this.renderChart({
          stock,
        })
      }).catch(_ => {
        console.error(_)
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
        this.$http.put(`/api/analyze/surgeForShort/batch`, {
          code,
          dateList
        }).then(_ => {
          if (code === this.code) {
            stock.surgeForShortList = _.filter(item => !!item.time)
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
    renderChart({stock}) {
      let rawData = stock.result
      this.stock = stock
      this.code = stock.code
      this.name = stock.name
      const data = lodash.takeRight(rawData, 200)
      this.calculateAmount(data)

      this.$refs.chart.renderChart(data, {
        assistantLine: this.getAssistantLine(stock)
      })
    },
    getAssistantLine(stock) {

//      view.line().position('timestamp*close').color('#4FAAEB').tooltip('close*percent').size(2)

      // 拉高出货点
      const surgeForShortList = stock.surgeForShortList || []
      // 追加限售解禁信息
      const restrictSellList = stock.base.restrict_sell_list || []
      // 追加高亮点
      const highlightPointList = [] //this.config ? this.config.highlight || [] : []

      // TODO 添加涨停，跌停到辅助线中 ？？

      const pointList = []
      Array.prototype.push.apply(pointList, surgeForShortList.map(item => ({ date: item.date, text: '拉高出货' })))
      Array.prototype.push.apply(pointList, restrictSellList.map(item => ({ date: item.date, text: '解禁' })))
      Array.prototype.push.apply(pointList, highlightPointList.map(item => ({ date: item.date, text: '当前点' })))

      const groupResult = lodash.groupBy(pointList, item => item.date)
      const assistantLineList = []
      Object.keys(groupResult).forEach(date => {
        const position = {
          start: [date, 'min'],
          end: [date, 'max']
        }

        assistantLineList.push({
          position,
          content: groupResult[date].map(item => item.text)
        })
      })

      return assistantLineList
    },
    dblclick(item) {
      this.$emit('dblclick', item)
    }
  }
}
</script>
