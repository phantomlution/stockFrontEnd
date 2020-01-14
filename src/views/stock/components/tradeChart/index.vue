<!-- 聚合三个图表 -->
<template>
  <div>
    <div>
      <!-- trade trend -->
      <stock-trend :code="code" v-if="code" @dblclick="displayItem"/>
    </div>
    <div>
      <!-- 分时成交 -->
      <lr-stick-bar placement="left-start" :visible.sync="visible" title="分时成交" :clearPadding="true" ref="bar" top="50%" v-if="code">
        <stock-history-tick :visible="visible" :code="code" :date.sync="historyDate" :height="320" style="min-width: 66vw;min-height: 420px"/>
      </lr-stick-bar>
    </div>
  </div>
</template>

<script>
import stockTrend from './trend.vue'
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
    stockHistoryTick
  },
  data() {
    return {
      visible: false,
      historyDate: null
    }
  },
  methods: {
    displayItem(meta) {
      this.$refs.bar.show()

      setTimeout(_ => {
        this.historyDate = this.$moment(meta.title).toDate()
      }, 0)
    }
  }
}
</script>
