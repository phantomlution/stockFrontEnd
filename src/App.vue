<template>
  <div id="app">
    <el-tabs v-model="currentTab">
      <el-tab-pane label="detail" name="detail"/>
      <el-tab-pane label="analyze" name="analyze"/>
    </el-tabs>
    <div>
      <div v-show="currentTab === 'detail'">
        <stock-detail />
      </div>
      <div v-show="currentTab === 'analyze'">
        <stock-analyze />
      </div>
    </div>
  </div>
</template>

<script>
import stockDetail from '@/views/stock/detail'
import stockAnalyze from '@/views/stock/analyze'

export default {
  components: {
    stockDetail,
    stockAnalyze
  },
  data() {
    return {
      currentTab: 'detail'
    }
  }
}
</script>

<style lang="scss">
#app {
  height: 100vh;
}
</style>
