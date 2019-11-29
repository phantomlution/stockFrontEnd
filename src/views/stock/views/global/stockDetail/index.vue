<template>
  <el-drawer title="个股详情" size="90%" :visible.sync="drawerVisible">
    <stock-detail :code="code" v-if="code" :defaultTab="defaultTab"/>
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
      code: '',
      defaultTab: ''
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
    this.$bus.$on('showStockDetail', ({ code, defaultTab }) => {
      console.log(defaultTab)
      this.code = code
      this.defaultTab = defaultTab
      this.drawerVisible = true
    })
  }
}
</script>
