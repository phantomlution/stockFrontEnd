<template>
  <div id="app" style="padding: 8px">
    <div>
      <lr-motto style="margin-bottom: 8px"></lr-motto>
      <el-tabs v-model="currentTab" type="card">
        <el-tab-pane label="重大事件" name="bigEvents"></el-tab-pane>
        <el-tab-pane label="情报中心" name="informationCenter"></el-tab-pane>
        <el-tab-pane label="资金流向" name="capitalFlow" ></el-tab-pane>
        <el-tab-pane label="未来经济预测" name="未来经济预测"></el-tab-pane>
        <el-tab-pane label="关注" name="figure"></el-tab-pane>
        <el-tab-pane label="个股" name="stockDetail" ></el-tab-pane>
        <el-tab-pane label="工具箱" name="toolPanel"></el-tab-pane>
        <el-tab-pane label="playground" name="playGround"></el-tab-pane>
      </el-tabs>

      <div v-show="currentTab === 'bigEvents'">
        <big-events />
      </div>
      <div v-show="currentTab === 'stockDetail'">
        <stock-detail />
      </div>
      <div v-if="currentTab === 'capitalFlow'">
        <capital-flow />
      </div>
      <div v-show="currentTab === 'figure'" >
        <person-figure />
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
      <div v-if="currentTab === '未来经济预测'">
        <futurePredict />
      </div>
    </div>
    <!--全局使用的组件-->
    <div>
      <column-panel />
    </div>
  </div>
</template>

<script>
import stockDetail from '@/views/stock/views/stock'
import informationCenter from '@/views/stock/views/informationCenter'
import toolPanel from '@/views/stock/views/tools/index'
import playGround from '@/views/stock/views/playground/index'
import capitalFlow from '@/views/stock/views/capitalFlow/index'
import bigEvents from '@/views/stock/views/bigEvents/index'
import columnPanel from '@/views/stock/views/global/columnPanel'
import personFigure from '@/views/stock/views/figure/index'
import futurePredict from '@/views/stock/views/futureEconomyPredict/index'

export default {
  components: {
    stockDetail,
    informationCenter,
    toolPanel,
    playGround,
    capitalFlow,
    bigEvents,
    columnPanel,
    personFigure,
    futurePredict
  },
  data() {
    return {
      currentTab: 'bigEvents'
    }
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
</style>
