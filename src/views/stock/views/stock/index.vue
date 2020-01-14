<template>
  <div>
    <div style="padding: 8px">
      <el-form :inline="true">
        <el-form-item label="交易代码：">
          <item-search ref="searchStock" @change="searchStock" style="width: 210px;"/>
        </el-form-item>
      </el-form>
      <stock-trade-chart :code="stockCode" ></stock-trade-chart>
    </div>
    <stock-assistant />
  </div>
</template>

<script>
import itemSearch from '@/views/stock/components/itemSearch.vue'
import stockAssistant from './stockAssistant.vue'
import tempAnalyze from './tempAnalyze.vue'
import stockTradeChart from '@/views/stock/components/tradeChart/index.vue'

export default {
  components: {
    itemSearch,
    stockAssistant,
    tempAnalyze,
    stockTradeChart
  },
  data() {
    return {
      stockCode: '',
      config: null
    }
  },
  mounted() {
    this.$bus.$on('searchStockDetail', item => {
      this.stockCode = item.code
    })
  },
  beforeDestroy() {
    this.$bus.$off('searchStockDetail')
  },
  methods: {
    searchStock(code) {
      this.stockCode = code
    }
  }
}
</script>
