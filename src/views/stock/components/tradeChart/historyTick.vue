<template>
  <lr-box v-if="stockCode">
    <div slot="title" v-if="!snapShot">
      <div style="display: flex">
        <div style="flex: 1;">
          <lr-stock-detail-link :code="stockCode" :add="false" defaultTab="trendAnalyze" />
          <lr-date-picker v-model="currentDate" @change="checkAndLoad" pattern="stock" />
        </div>
        <div>
          <surge-for-short-point :visible="visible" ref="point" :hasItem="hasItem"/>
        </div>
      </div>
    </div>
    <div>
      <stock-price-chart ref="chart" :height="height" @dblclick="pointClick"/>
    </div>
  </lr-box>
</template>

<script>
import { STOCK_COORDINATE_DATE } from '@/utils/ChartUtils'
import stockPriceChart from '../stockPriceChart.vue'
import lodash from 'lodash'
import surgeForShortPoint from './analyze/surgeForShortPointCheck.vue'

const props = {
  code: { // 指定代码
    type: String,
    default: ''
  },
  date: {
    type: [Date, String]
  },
  height: {
    type: Number
  },
  visible: { // 外部容器的可见状态
    type: Boolean,
    default: true
  },
  snapShot: { // 快照模式，只显示图表
    type: Boolean,
    default: false

  }

}
export default {
  props,
  components: {
    stockPriceChart,
    surgeForShortPoint
  },
  data() {
    return {
      stockCode: this.code,
      currentDate: this.date || null,
    }
  },
  computed: {
    hasItem() {
      return !!this.code && !!this.date
    }
  },
  watch: {
    date(val) {
      this.currentDate = val
    },
    code(val) {
      this.currentDate = null
      this.stockCode = val
    },
    currentDate(val) {
      if (!val) {
        const chart = this.$refs.chart.getChart()
        chart.clear()
      }
      this.$emit('update:date', val)
    }
  },
  mounted() {
    if (this.stockCode && this.currentDate) {
      this.loadData()
    }
  },
  methods: {
    pointClick(item) { // 分时图被双击
      if (this.stockCode && this.currentDate) {
        const code = this.stockCode
        const date = this.$moment(this.currentDate).format('YYYY-MM-DD')

        const time = item['title']

        this.$refs.point.setTime(code, date, time)
      }
    },
    checkAndLoad() {
      this.$nextTick(_ => {
        if (this.stockCode && this.currentDate) {
          this.loadData()
        }
      })
    },
    loadData() {
      if (!this.stockCode) {
        return this.$message.error('请选择代码')
      }
      if (!this.currentDate) {
        return this.$message.error('请选择日期')
      }
      const code = this.stockCode
      const date = this.$moment(this.currentDate).format('YYYY-MM-DD')


      // 加载点位分析
      this.$refs.point && this.$refs.point.load(code, date)

      this.$http.get('/api/analyze/history/fragment/trade', {
        code,
        date
      }).then(tradeList => {
        if (!tradeList) {
          tradeList = []
        }
        this.renderChart(tradeList)
      }).catch(_ => {
        console.error(_)
      })
    },
    normalize(dealPointList) { // 将分时成交数据按照1分钟的序列进行合并
      dealPointList.forEach(item => {
        item.timestamp = this.$moment(`${ STOCK_COORDINATE_DATE } ${ item.time }`).toDate().getTime()
      })
      const result = []

      if (dealPointList[0].time.indexOf('09:25') !== -1) {
        result.push({
          time: '09:25:00',
          price: dealPointList[0].price,
          amount: dealPointList[0].amount
        })
      }
      ;['09:30', '13:00'].forEach(time => {
        for(let i=0; i<=120; i++) {
          const currentMinute = this.$moment(`${ STOCK_COORDINATE_DATE } ${ time }:00`).add(i, 'minutes').format('HH:mm')
          const startTime = this.$moment(`${ STOCK_COORDINATE_DATE } ${ currentMinute }:00`).toDate().getTime()
          const endTime = this.$moment(`${ STOCK_COORDINATE_DATE } ${ currentMinute }:59`).toDate().getTime()

          const currentMinutePriceList = dealPointList.filter(item => item.timestamp >= startTime && item.timestamp <= endTime)
          if (currentMinutePriceList.length === 0){
            result.push({
              time: `${ currentMinute }:00`,
              price: result[result.length - 1].price,
              amount: result[result.length - 1].amount
            })
          } else {
            result.push({
              time: `${ currentMinute }:00`,
              price: currentMinutePriceList[currentMinutePriceList.length -1].price,
              amount: currentMinutePriceList[currentMinutePriceList.length -1].amount
            })
          }
        }
      })

      return result
    },
    renderChart(tradeList) {
      if (tradeList.length === 0) {
        this.$refs.chart.updateChart(tradeList)
        return
      }

      const yesterdayClose = lodash.round(tradeList[0].price - tradeList[0].change, 2)
      const dataList = this.normalize(tradeList)

      this.$refs.chart.updateChart(dataList, yesterdayClose)
    }
  }
}

</script>
