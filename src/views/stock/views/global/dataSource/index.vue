<template>
  <el-popover>
    <stock-data @change="updateState"/>
    <el-button slot="reference" :type="state" size="small" circle icon="el-icon-s-promotion"></el-button>
  </el-popover>
</template>

<script>
import stockData from './stock.vue'

export default {
  components: {
    stockData
  },
  data() {
    return {
      state: ''
    }
  },
  methods: {
    updateState(state) {
      this.state = state
    }
  }
}
</script>
