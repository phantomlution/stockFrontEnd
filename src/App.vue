<template>
  <div id="app" style="padding: 8px">
    <lr-motto style="margin-bottom: 8px"></lr-motto>
    <el-tabs v-model="currentTab" type="card">
      <el-tab-pane label="重大事件" name="bigEvents"></el-tab-pane>
      <el-tab-pane label="个股" name="detail" ></el-tab-pane>
      <el-tab-pane label="资金流向" name="capitalFlow" ></el-tab-pane>
      <el-tab-pane label="情报中心" name="informationCenter"></el-tab-pane>
      <el-tab-pane label="工具箱" name="toolPanel"></el-tab-pane>
      <el-tab-pane label="playground" name="playGround"></el-tab-pane>
    </el-tabs>

    <div v-show="currentTab === 'bigEvents'">
      <big-events />
    </div>
    <div v-show="currentTab === 'detail'">
      <stock-detail />
    </div>
    <div v-show="currentTab === 'capitalFlow'">
      <capital-flow />
    </div>
    <div v-if="currentTab === 'informationCenter'">
      <information-center />
    </div>
    <div v-if="currentTab === 'toolPanel'">
      <tool-panel />
    </div>
    <div v-if="currentTab === 'playGround'">
      <play-ground />
    </div>
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
