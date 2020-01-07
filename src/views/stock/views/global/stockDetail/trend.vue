<template>
  <stock-trade-chart :code="code" />
</template>

<script>
import stockTradeChart from '@/views/stock/components/tradeChart/index.vue'

const props = {
  code: {
    type: String,
    required: true
  }
}
export default {
  props,
  components: {
    stockTradeChart
  }
}
</script>
