<template>
  <div id="app">
    <el-tabs v-model="currentTab">
      <el-tab-pane label="个股" name="detail"/>
      <el-tab-pane label="情报中心" name="informationCenter" />
      <el-tab-pane label="大盘" name="analyze"/>
    </el-tabs>
    <div>
      <div v-show="currentTab === 'detail'">
        <stock-detail />
      </div>
      <div v-if="currentTab === 'analyze'">
        <stock-analyze />
      </div>
      <div v-if="currentTab === 'informationCenter'">
        <information-center />
      </div>
    </div>
  </div>
</template>

<script>
import stockDetail from '@/views/stock/detail'
import stockAnalyze from '@/views/stock/analyze'
import informationCenter from '@/views/stock/information'

export default {
  components: {
    stockDetail,
    stockAnalyze,
    informationCenter
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
