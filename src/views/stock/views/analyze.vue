<template>
  <div>
    <lr-box >
      <el-button type="primary" @click.stop="refresh">启动</el-button>
    </lr-box>
    <market-heat />
    <low-price-count />
  </div>
</template>

<script>
import marketHeat from '@/views/stock/chart/marketHeat.vue'
import lowPriceCount from '@/views/stock/chart/lowPriceCount.vue'
import stockUtils from '@/utils/stockUtils'
import lodash from 'lodash'

export default {
  components: {
    marketHeat,
    lowPriceCount
  },
  methods: {
    refresh() {
      this.analyze()
    },
    analyze() {
      const stockMap = this.$store.state.data.stockMap
      this.$store.dispatch('updateData', {
        key: 'marketHeat',
        data: stockUtils.calculateMarketTrendPercentage(stockMap, 100)
      })

      this.calculateLowPriceStock()
    },
    getTradeDateList() { // 获取交易日期列表
      const historyTradeItemCount = 120
      const historyTradeDateRange = 120
      return new Promise((resolve, reject) => {
        this.$http.get('api/stock/index', {
          code: 'SH000001',
          count: historyTradeItemCount
        }).then(response => {
          const timestampIndex = response.column.indexOf('timestamp')
          const lastDays = historyTradeDateRange
          const lastDataList = lodash.takeRight(response.data, lastDays)
          const result = lastDataList.map(item => {
            return item[timestampIndex]
          })
          resolve(result)
        }).catch(_ => {
          reject(_)
        })
      })
    },
    calculateLowPriceStock() { // 计算低价股票
      this.getTradeDateList().then(tradeDateList => {
        const result = []
        tradeDateList.forEach(tradeDate => {
          const dateString = stockUtils.dateFormat(tradeDate)
          const analyzeResult = this.analyzeProbability({
            targetDate: new Date(tradeDate)
          })
          result.push({
            date: dateString,
            fivePercentCount: analyzeResult.filter(item => item.targetDate === dateString && item.closeIncrement <= 5).length,
            tenPercentCount: analyzeResult.filter(item => item.targetDate === dateString && item.closeIncrement <= 10).length
          })
        })

        this.$store.dispatch('updateData', {
          key: 'lowPriceCount',
          data: result
        })
      }).catch(_ => {
        console.error(_)
      })
    }
  }
}
</script>
