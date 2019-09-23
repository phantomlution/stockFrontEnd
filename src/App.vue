<template>
  <div id="app" style="padding: 8px">
    <lr-motto style="margin-bottom: 8px"/>
    <el-tabs v-model="currentTab" type="card">
      <el-tab-pane label="重大事件" name="bigEvents">
        <big-events />
      </el-tab-pane>
      <el-tab-pane label="个股" name="detail">
        <stock-detail />
      </el-tab-pane>
      <el-tab-pane label="资金流向" name="capitalFlow">
        <capital-flow />
      </el-tab-pane>
      <el-tab-pane label="情报中心" name="informationCenter">
        <information-center />
      </el-tab-pane>
      <el-tab-pane label="工具箱" name="toolPanel">
        <tool-panel />
      </el-tab-pane>
      <el-tab-pane label="playground" name="playGround">
        <play-ground />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import stockDetail from '@/views/stock/views/detail'
import informationCenter from '@/views/stock/views/informationCenter'
import toolPanel from '@/views/stock/views/tools'
import playGround from '@/views/stock/views/playground'
import capitalFlow from '@/views/stock/views/capitalFlow'
import bigEvents from '@/views/stock/views/bigEvents/index'

export default {
  components: {
    stockDetail,
    informationCenter,
    toolPanel,
    playGround,
    capitalFlow,
    bigEvents
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
