<template>
  <div>
    <market-heat />
    <low-price-count />
  </div>
</template>

<script>
import marketHeat from './chart/marketHeat.vue'
import lowPriceCount from './chart/lowPriceCount.vue'

export default {
  components: {
    marketHeat,
    lowPriceCount
  },
  data() {
    return {
    }
  }
}
</script>
