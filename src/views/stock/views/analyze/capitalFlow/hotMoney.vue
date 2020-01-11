<template>
  <div style="font-size: 14px; color: rgba(0, 0, 0, 0.65)">
    <!-- 简要的文本信息展示区 -->
    <div v-if="showLabel">
      <span>
        <span style="font-weight: bold">北向资金</span>
        <span>(</span>
        <span class="lr-hot-money-label__sub">当前:<lr-number-tag :amount="northAnalyzeModel.current" unit="亿"></lr-number-tag></span>
        <span class="lr-hot-money-label__sub">最高:<lr-number-tag :amount="northAnalyzeModel.max" unit="亿"></lr-number-tag></span>
        <span class="lr-hot-money-label__sub">最低:<lr-number-tag :amount="northAnalyzeModel.min" unit="亿"></lr-number-tag></span>
        <span>)</span>
      </span>
    </div>
    <!-- 图形展示区 -->
    <div>
      <div v-if="showNorthChart">
        <span v-if="!lightMode">
          北向资金(亿元)
        </span>
        <lr-chart ref="northChart" :height="height" :usePadding="useChartPadding" />
      </div>
    </div>
  </div>
</template>

<script>
import lodash from 'lodash'
import { addStockDailyCoordinate, STOCK_COORDINATE_DATE } from '@/utils/ChartUtils'
import scheduleMixin, { STOP_CALLBACK_FOR_STOCK } from '@/mixins/schedule'

const props = {
  showLabel: {
    type: Boolean,
    default: false
  },
  showNorthChart: {
    type: Boolean,
    default: true
  },
  showSouthChart: {
    type: Boolean,
    default: true
  },
  height: {
    type: Number,
    default: 0.5
  },
  lightMode: { // 是否轻量化展示
    type: Boolean,
    default: false
  },
  live: {
    type: Boolean,
    default: true
  }
}

export default {
  props,
  mixins: [scheduleMixin],
  data() {
    return {
      northAnalyzeModel: this.getAnalyzeModel([]),
      southAnalyzeModel: this.getAnalyzeModel([]),
    }
  },
  computed: {
    useChartPadding() {
      return !this.lightMode
    },
    chart() {
      return this.$refs.chart.getChart()
    }
  },
  mounted() {
    this.startSchedule(this.loadData, 5, STOP_CALLBACK_FOR_STOCK)
  },
  methods: {
    formatDate(date) {
      return this.$moment(date).format('YYYY-MM-DD')
    },
    loadData(date = new Date()) {

      const query = {
        live: this.live,
        date,
        code: 'CAPITAL.NORTH'
      }

      this.$http.get(`/api/stock/capital/hotMoney`, query).then(response => {
        // 生成数据
        const northChartData = this.getChartData(response.list)
//        const southChartData = this.getChartData('n2s', result)

        // 生成文本
        this.northAnalyzeModel = this.getAnalyzeModel(northChartData)
//        this.southAnalyzeModel = this.getAnalyzeModel(southChartData)

        // 更新图表
        this.showNorthChart && this.renderChart('northChart', northChartData, [
          '沪股通',
          '深股通',
          '北向资金'
        ])

//        this.showSouthChart && this.renderChart('southChart', southChartData, [
//          '港股通(沪)',
//          '港股通(深)',
//          '南向资金'
//        ])

      }).catch(_ => {
        console.error(_)
      })
    },
    getAnalyzeModel(data) {
      const totalAmountDataList = data.filter(item => item.type === '2')
      const validAmountDataList = totalAmountDataList.filter(item => item.value)
      const maxValue = lodash.maxBy(totalAmountDataList, 'value')
      const minValue = lodash.minBy(totalAmountDataList, 'value')

      return {
        "current": validAmountDataList.length > 0 ? validAmountDataList[validAmountDataList.length - 1].value : '',
        "max": maxValue ? maxValue.value : '',
        "min": minValue ? minValue.value : ''
      }
    },
    getChartData(response) {
      const result = []

      response.forEach(item => {
        function getLastResult(val) {
          val = Number(val)
          return Number((val / 10000 / 10000).toFixed(2))
        }
        let time = this.appendDate(item.time)
        let huAmount = getLastResult(item['huAmount'])
        let shenAmount = getLastResult(item['shenAmount'])
        let totalAmount = (huAmount && shenAmount) ?Number((huAmount + shenAmount).toFixed(2)) : null

        result.push({
          time,
          type: "0",
          value: huAmount
        })
        result.push({
          time,
          type: "1",
          value: shenAmount
        })
        result.push({
          time,
          type: '2',
          value: totalAmount
        })
      })

      return result
    },
    appendDate(timePoint) { // 补齐日期格式
      return `${ STOCK_COORDINATE_DATE } ${ timePoint }:00`
    },
    renderChart(vueReference, chartData, legend) {
      const chart = this.$refs[vueReference].getChart()
      chart.clear()
      if (chartData.length === 0) {
        return
      }
      const capitalLegend = legend
      chart.source(chartData)
      chart.scale('type', {
        formatter: function(val) {
          return capitalLegend[val]
        }
      })

      addStockDailyCoordinate(chart)

      chart.line().position('time*value').color('type')
      chart.render()
    }
  }
}
</script>

<style lang="scss">
.lr-hot-money-label__sub{
  display: inline-block;
  & + .lr-hot-money-label__sub{
    margin-left: 8px;
  }
}
</style>
