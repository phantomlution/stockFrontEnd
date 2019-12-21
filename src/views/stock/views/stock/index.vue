<template>
  <div style="overflow: auto">
    <div>
      <lr-box>
        <div style="display: flex">
          <div style="width: 420px">
            <search-stock v-model="stockCode" ref="searchStock" @change="searchStock"/>
          </div>
          <div>
            <el-button @click.stop="useFragment = !useFragment">
              <template v-if="useFragment">关闭</template><template v-else>打开</template>成交量分析
            </el-button>
          </div>
        </div>
      </lr-box>
      <trade-trend-chart :code="stockCode" :config="config" :showAdd="true" :autoUpdate="useChart" v-if="stockCode"/>
      <history-fragment-deal :code="stockCode" v-if="useFragment && stockCode"/>
      <trade-data-chart :code="stockCode" :showAdd="true" :autoUpdate="useChart" v-if="stockCode"/>
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
      useFragment: false,
      config: null
    }
  },
  mounted() {
    this.$bus.$on('searchStockDetail', item => {
      this.stockCode = item.code
      this.config = item
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
