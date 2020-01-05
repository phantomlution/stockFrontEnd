<template>
  <div>
    <div style="padding: 8px">
      <el-form :inline="true">
        <el-form-item label="股票代码：">
          <search-stock v-model="stockCode" ref="searchStock" @change="searchStock"/>
        </el-form-item>
      </el-form>
      <stock-trade-chart :code="stockCode" ></stock-trade-chart>
    </div>
    <stock-assistant />
  </div>
</template>

<script>
import searchStock from '@/views/stock/components/searchStock.vue'
import stockAssistant from './stockAssistant.vue'
import tempAnalyze from './tempAnalyze.vue'
import stockTradeChart from '@/views/stock/components/tradeChart/index.vue'

export default {
  components: {
    searchStock,
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
      this.$bus.$emit('searchStockDetail', {
        code
      })
    }
  }
}
</script>
