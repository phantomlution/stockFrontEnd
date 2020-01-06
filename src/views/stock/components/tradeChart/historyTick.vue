<template>
  <lr-box style="margin-top: 16px" v-if="stockCode">
    <div slot="title">
      <search-stock v-model="stockCode" @change="checkAndLoad" v-if="!code"/>
      <lr-date-picker v-model="currentDate" :pattern="stock" @change="checkAndLoad" pattern="stock" />
      <lr-stock-detail-link :code="stockCode" :add="false" defaultTab="trendAnalyze" />
      <span v-if="date" style="font-size: 14px;color: rgba(0, 0, 0, 0.65)">
        {{ currentDate | date }}
      </span>
      <span>
        <el-button @click.stop="test">test</el-button>
        result: {{ testResult}}
      </span>
    </div>
    <div>
      <stock-price-chart ref="chart" :height="height" />
    </div>
  </lr-box>
</template>

<script>
import searchStock from '@/views/stock/components/searchStock'
import { STOCK_COORDINATE_DATE } from '@/utils/ChartUtils'
import stockPriceChart from '../stockPriceChart.vue'
import lodash from 'lodash'

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
  }
}
export default {
  props,
  components: {
    searchStock,
    stockPriceChart
  },
  data() {
    return {
      stockCode: this.code,
      currentDate: this.date || null,
      testResult: null
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
  methods: {
    test() {
      const code = this.code
      const date = this.$moment(this.currentDate).format('YYYY-MM-DD')
      this.$http.get(`/api/analyze/surge_for_short`, {
        code,
        date
      }).then(testResult => {
        this.testResult = {
          date,
          testResult
        }
      })
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
      const result = [];

      if (dealPointList[0].time.indexOf('09:25') !== -1) {
        result.push({
          time: '09:25:00',
          price: dealPointList[0].price
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
              price: result[result.length - 1].price
            })
          } else {
            result.push({
              time: `${ currentMinute }:00`,
              price: currentMinutePriceList[currentMinutePriceList.length -1].price
            })
          }
        }
      })

      return result
    },
    renderChart(tradeList) {
      if (tradeList.length === 0) {
        this.$message.warning('暂无数据')
        return
      }

      const yesterdayClose = lodash.round(tradeList[0].price - tradeList[0].change, 2)
      const dataList = this.normalize(tradeList)

      this.$refs.chart.updateChart(dataList, yesterdayClose)
    }
  }
}

</script>