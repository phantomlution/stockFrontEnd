<template>
  <div id="app" style="padding: 8px">
    <div>
      <lr-motto style="margin-bottom: 8px"></lr-motto>
      <el-tabs v-model="currentTab" type="card">
        <el-tab-pane label="重大事件" name="bigEvents"></el-tab-pane>
        <el-tab-pane label="情报中心" name="informationCenter"></el-tab-pane>
        <el-tab-pane label="未来经济预测" name="未来经济预测"></el-tab-pane>
        <el-tab-pane label="个股" name="stockDetail" ></el-tab-pane>
        <el-tab-pane label="工具箱" name="toolPanel"></el-tab-pane>
        <el-tab-pane label="DashBoard" name="dashBoard"></el-tab-pane>
        <el-tab-pane label="统计分析" name="统计分析"></el-tab-pane>
      </el-tabs>

      <div v-show="currentTab === 'bigEvents'">
        <big-events />
      </div>
      <div v-show="currentTab === 'stockDetail'">
        <!-- 初始化数据 -->
        <stock-detail />
      </div>
      <div v-if="currentTab === 'informationCenter'">
        <information-center />
      </div>
      <div v-if="currentTab === 'toolPanel'">
        <tool-panel />
      </div>
      <div v-if="currentTab === 'dashBoard'">
        <dash-board />
      </div>
      <div v-if="currentTab === '未来经济预测'">
        <futurePredict />
      </div>
      <div v-if="currentTab === '统计分析'">
        <analyze-panel />
      </div>
    </div>
    <!--全局使用的组件-->
    <div>
      <column-panel />
      <stock-detail-panel />
      <news-panel />
    </div>
  </div>
</template>

<script>
import stockDetail from '@/views/stock/views/stock'
import informationCenter from '@/views/stock/views/informationCenter'
import toolPanel from '@/views/stock/views/tools/index'
import dashBoard from '@/views/stock/views/dashBoard/index'
import bigEvents from '@/views/stock/views/bigEvents/index'
import columnPanel from '@/views/stock/views/global/columnPanel'
import futurePredict from '@/views/stock/views/futureEconomyPredict/index'
import stockDetailPanel from '@/views/stock/views/global/stockDetailPanel'
import analyzePanel from '@/views/stock/views/analyze/index'
import newsPanel from '@/views/stock/views/global/news/index'

export default {
  components: {
    stockDetail,
    informationCenter,
    toolPanel,
    dashBoard,
    bigEvents,
    columnPanel,
    futurePredict,
    stockDetailPanel,
    analyzePanel,
    newsPanel
  },
  data() {
    return {
      currentTab: 'bigEvents'
    }
  },
  mounted() {

  }
}
</script>

<style lang="scss">
#app {
  height: 100vh;
}

.lr-hover{
  &:hover{
    cursor: pointer;
  }
}

.el-popover{
  &.lr-clear{
    padding: 0;
  }
}
</style>
