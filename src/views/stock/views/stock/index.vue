<template>
  <div style="overflow: auto">
    <div style="padding: 8px">
      <el-form :inline="true">
        <el-form-item label="股票代码：">
          <search-stock v-model="stockCode" ref="searchStock" @change="searchStock"/>
        </el-form-item>
      </el-form>
      <trade-trend-chart :code="stockCode" :config="config" :showAdd="true" v-if="stockCode"/>
      <trade-data-chart :code="stockCode" :showAdd="true" v-if="stockCode"/>
      <history-fragment-deal :code="stockCode" v-if="stockCode" :date.sync="historyDate"/>
    </div>
    <stock-assistant @showDetail="showDetail" />
  </div>
</template>

<script>
import tradeDataChart from '@/views/stock/components/tradeDataChart.vue'
import tradeTrendChart from '@/views/stock/components/tradeTrendChart.vue'
import searchStock from '@/views/stock/components/searchStock.vue'
import historyFragmentDeal from '@/views/stock/components/historyFragmentDeal.vue'
import stockAssistant from './stockAssistant.vue'

export default {
  components: {
    tradeDataChart,
    tradeTrendChart,
    searchStock,
    historyFragmentDeal,
    stockAssistant
  },
  data() {
    return {
      stockCode: '',
      historyDate: null,
      config: null
    }
  },
  mounted() {
    this.$bus.$on('searchStockDetail', item => {
      this.stockCode = item.code
      this.config = item
      if (item.date) {
        this.historyDate = this.$moment(item.date).toDate()
      } else {
        this.historyDate = this.$moment().toDate()
      }
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
    },
    showDetail() {

    },
  }
}
</script>
