<template>
  <el-drawer title="个股详情" size="90%" :visible.sync="drawerVisible">
    <stock-detail :code="code" v-if="code"/>
  </el-drawer>
</template>

<script>
import stockDetail from './stockDetail.vue'

export default {
  components: {
    stockDetail
  },
  data() {
    return {
      drawerVisible: false,
      code: ''
    }
  },
  watch: {
    drawerVisible(val) {
      if (!val) {
        this.code = ''
      }
    }
  },
  mounted() {
    this.$bus.$on('showStockDetail', code => {
      this.code = code
      this.drawerVisible = true
    })
  }
}
</script>
