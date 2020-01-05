<!-- 聚合三个图表 -->
<template>
  <div>
    <div>
      <!-- trade trend -->
      <stock-trend :code="code" v-if="code" @dblclick="displayItem"/>
    </div>
    <div>
      <stock-kline :code="code" v-if="code" @dblclick="displayItem"/>
    </div>
    <div>
      <!-- 分时成交 -->
      <lr-stick-bar title="分时成交" :visible.sync="visible" top="50%" v-if="code">
        <stock-history-tick :code="code" :date.sync="historyDate" :height="400" style="min-width: 66vw;min-height: 400px"/>
      </lr-stick-bar>
    </div>
  </div>
</template>

<script>
import stockTrend from './trend.vue'
import stockKline from './kline.vue'
import stockHistoryTick from './historyTick.vue'

const props = {
  code: {
    type: String,
    required: true
  }
}

export default {
  props,
  components: {
    stockTrend,
    stockKline,
    stockHistoryTick
  },
  data() {
    return {
      historyDate: null,
      visible: false
    }
  },
  methods: {
    displayItem(meta) {
      this.visible = true

      setTimeout(_ => {
        this.historyDate = this.$moment(meta.title).toDate()
      }, 0)
    }
  }
}
</script>
