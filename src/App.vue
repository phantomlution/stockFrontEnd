<template>
  <div id="app" tabindex="0" @keydown.down.prevent="handleKeyDown">
    <div>
      <!--全局使用的组件-->
      <div>
        <fast-reader ref="reader"/>
        <global-item />
      </div>
      <!-- 页面内容 -->
      <div>
        <!--<lr-hint />-->
        <el-tabs v-model="currentTab" type="card" style="margin-top: 8px">
          <el-tab-pane label="每日分析" name="chessManual"></el-tab-pane>
          <el-tab-pane label="大事件" name="bigEvents"></el-tab-pane>
          <el-tab-pane label="个股" name="stockDetail" ></el-tab-pane>
          <el-tab-pane label="DashBoard" name="dashBoard"></el-tab-pane>
          <el-tab-pane label="宏观数据" name="宏观数据"></el-tab-pane>
          <el-tab-pane label="统计分析" name="统计分析"></el-tab-pane>
        </el-tabs>
      </div>
      <div>
        <div v-show="currentTab === 'chessManual'">
          <chess-manual />
        </div>
        <div v-if="currentTab === 'bigEvents'">
          <big-events />
        </div>
        <div v-show="currentTab === 'stockDetail'">
          <!-- 初始化数据 -->
          <stock-detail />
        </div>
        <div v-if="currentTab === 'dashBoard'">
          <dash-board />
        </div>
        <div v-if="currentTab === '宏观数据'">
          <futurePredict />
        </div>
        <div v-if="currentTab === '统计分析'">
          <analyze-panel />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import stockDetail from '@/views/stock/views/stock'
import dashBoard from '@/views/stock/views/dashBoard/index'
import bigEvents from '@/views/stock/views/bigEvents/index'
import futurePredict from '@/views/stock/views/futureEconomyPredict/index'
import analyzePanel from '@/views/stock/views/analyze/index'
import globalItem from '@/views/stock/views/global/index'
import lrHint from '@/views/stock/views/global/hint/index'
import chessManual from '@/views/stock/views/chessManual/index'
import fastReader from '@/views/stock/views/global/fastReader/index'

export default {
  components: {
    stockDetail,
    dashBoard,
    bigEvents,
    futurePredict,
    analyzePanel,
    globalItem,
    lrHint,
    chessManual,
    fastReader
  },
  data() {
    return {
      currentTab: 'chessManual'
    }
  },
  watch: {
    currentTab() {
      this.$bus.$emit('close_all_stick_bar')
    }
  },
  methods: {
    handleKeyDown() {
      this.$refs.reader.toNext()
    }
  }
}
</script>

<style lang="scss">
#app {
  height: 100vh;
  padding: 8px;
  outline: none;
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

.el-drawer__body{
  overflow: auto;
}
p {
  margin-block-end: 0;
}
p:first-child{
  margin-block-start: 0;
}

.el-timeline.lr-pretty{
  padding-left: 100px;
  .el-timeline-item__timestamp{
    position: absolute;
    left: -88px;
  }
  .el-timeline-item:last-child{
    padding-bottom: 0;
  }
}
</style>
