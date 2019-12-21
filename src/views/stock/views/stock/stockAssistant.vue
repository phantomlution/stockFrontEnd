<template>
  <lr-stick-bar title="选股助手" width="600" top="128px">
    <div>
      <el-tabs v-model="currentTab" type="card">
        <el-tab-pane label="三阶段模型" name="threePhase">
          <three-phase />
        </el-tab-pane>
        <el-tab-pane label="自助分析" name="customAnalyze">
          <custom-analyze />
        </el-tab-pane>
      </el-tabs>
    </div>
  </lr-stick-bar>
</template>

<script>
import threePhase from './analyzeModel/threePhase.vue'
import customAnalyze from './analyzeModel/customAnalyze.vue'

export default {
  components: {
    threePhase,
    customAnalyze
  },
  data() {
    return {
      currentTab: 'threePhase'
    }
  }
}
</script>
