<template>
  <div>
    <analyze-wrapper :analyzePromise="startAnalyze">
      <el-form :inline="true" slot="params" style="display: inline-block">
        <el-form-item label="历史涨停">
          <el-switch v-model="hasEverLimitUp" />
        </el-form-item>
      </el-form>
    </analyze-wrapper>
  </div>
</template>

<script>
import { STOCK_PRICE_MIN, STOCK_PRICE_MAX } from '@/utils/stock'
import lodash from 'lodash'
import { idGenerator, deepClone } from '@/utils'
import analyzeWrapper from './analyzeWrapper.vue'

export default {
  components: {
    analyzeWrapper
  },
  data() {
    return {
      hasEverLimitUp: true,
    }
  },
  computed: {
    stockMap() {
      return this.$store.state.data.stockMap
    }
  },
  methods: {
    startAnalyze() {
      const itemList = this.analyzeProbability()
      return this.rankItem(itemList)
    },
    rankItem(data) {

      let firstRoundDataList = data
        .filter(item => item.close >= STOCK_PRICE_MIN)
        .filter(item => item.close <= STOCK_PRICE_MAX)
        .filter(item => item.amount >= 20 * 100 * 10000) // 成交量基本要求
        .filter(item => item.closeMaxIncrement <= -20) // 低于最高值 20%

      // 低价的股票可能说明股票没有价值

      if (this.hasEverLimitUp) {
        firstRoundDataList = firstRoundDataList.filter(item => item.limitUpCount > 0) // 发生过涨停，至少证明曾经有游资
      } else {
        firstRoundDataList = firstRoundDataList.filter(item => item.limitUpCount === 0) // 发生过涨停，至少证明曾经有游资
      }

      this.dataList = firstRoundDataList.map(item => {
        return {
          name: item.name,
          code: item.code,
          desc: item.desc
        }
      })

      return Promise.resolve(this.dataList)
    },
    analyzeProbability() {
      const collector = []
      for(let stock of this.stockMap.values()) {
        const targetStockResult = stock.result

        const targetStockResultData = lodash.takeRight(targetStockResult, 100)
        const closePriceList = targetStockResultData.map(item => item.close)
        const limitUpCount = targetStockResultData.filter(item => item.percent >= 9.9).length

        const today = targetStockResultData[targetStockResultData.length - 1]

        const model = {
          code: stock.code,
          name: stock.name,
          targetDate: today.date,
          lastDiff: today.diff,
          close: today.close,
          amount: today.amount,
          minClose: lodash.min(closePriceList),
          maxClose: lodash.max(closePriceList),
          limitUpCount
        }

        model.closeMaxIncrement = lodash.round((model.close / model.maxClose - 1) * 100)
        model.desc = `低于最高:${ model.closeMaxIncrement }%`
        collector.push(model)
      }

      return collector
    }
  }
}
</script>
