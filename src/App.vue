<template>
  <div id="app">
    <el-tabs v-model="currentTab" style="margin-left: 8px">
      <el-tab-pane label="个股" name="detail"/>
      <el-tab-pane label="资金流向" name="capitalFlow" />
      <el-tab-pane label="重大事件" name="bigEvents" />
      <el-tab-pane label="复盘" name="replay" />
      <el-tab-pane label="情报中心" name="informationCenter" />
      <el-tab-pane label="大盘" name="analyze"/>
      <el-tab-pane label="工具箱" name="toolPanel" />
      <el-tab-pane label="playground" name="playGround" />
      <el-tab-pane label="公告检索" name="noticeSearch" />
      <el-tab-pane label="主题筛选器" name="theme" />
      <el-tab-pane label="市场价格" name="marketPrice" />
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
      <div v-if="currentTab === 'toolPanel'">
        <tool-panel />
      </div>
      <div v-show="currentTab === 'playGround'">
        <play-ground />
      </div>
      <div v-if="currentTab === 'noticeSearch'">
        <notice-search />
      </div>
      <div v-if="currentTab === 'theme'" >
        <theme />
      </div>
      <div v-if="currentTab === 'marketPrice'">
        <market-price />
      </div>
      <div v-if="currentTab === 'capitalFlow'">
        <capital-flow />
      </div>
      <div v-if="currentTab === 'replay'">
        <replay />
      </div>
      <div v-if="currentTab === 'bigEvents'">
        <big-events />
      </div>
    </div>
  </div>
</template>

<script>
import stockDetail from '@/views/stock/views/detail'
import stockAnalyze from '@/views/stock/views/analyze'
import informationCenter from '@/views/stock/views/information'
import toolPanel from '@/views/stock/views/tools'
import playGround from '@/views/stock/views/playground'
import noticeSearch from '@/views/stock/views/noticeSearch'
import theme from '@/views/stock/views/theme'
import marketPrice from '@/views/stock/views/marketPrice'
import capitalFlow from '@/views/stock/views/capitalFlow'
import replay from '@/views/stock/views/replay'
import bigEvents from '@/views/stock/views/bigEvents'

export default {
  components: {
    stockDetail,
    stockAnalyze,
    informationCenter,
    toolPanel,
    playGround,
    noticeSearch,
    theme,
    marketPrice,
    capitalFlow,
    replay,
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
