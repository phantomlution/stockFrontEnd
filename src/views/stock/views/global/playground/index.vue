<template>
  <div>
    <!--<stock-history-tick :code="code" :date.sync="historyDate" :height="400" style="min-width: 66vw;min-height: 400px"/>-->
  </div>
</template>

<script>
import stockHistoryTick from '../../../components/tradeChart/historyTick.vue'

export default {
  data() {
    return {
      code: 'SZ000001',
      historyDate: this.$moment().add('days', -4).toDate()
    }
  },
  components: {
    stockHistoryTick
  }
}
</script>
