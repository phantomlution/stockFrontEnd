<template>
  <el-popover>
    <stock-data />
    <el-button slot="reference" size="small" circle icon="el-icon-s-promotion"></el-button>
  </el-popover>
</template>

<script>
import stockData from './stock.vue'

export default {
  components: {
    stockData
  },
}
</script>
