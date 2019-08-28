<template>
  <div id="app">
    <el-tabs v-model="currentTab">
      <el-tab-pane label="个股" name="detail"/>
      <el-tab-pane label="情报中心" name="informationCenter" />
      <el-tab-pane label="大盘" name="analyze"/>
      <el-tab-pane label="工具箱" name="toolPanel" />
      <el-tab-pane label="playground" name="playGround" />
      <el-tab-pane label="公告检索" name="noticeSearch" />
      <el-tab-pane label="板块筛选器" name="theme" />
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

export default {
  components: {
    stockDetail,
    stockAnalyze,
    informationCenter,
    toolPanel,
    playGround,
    noticeSearch,
    theme
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
