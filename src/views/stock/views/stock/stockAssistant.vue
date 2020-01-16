<template>
  <div>
    <lr-stick-bar title="三阶段模型" width="600" top="80px">
      <three-phase />
    </lr-stick-bar>
    <lr-stick-bar title="自助分析" width="600" top="140px">
      <custom-analyze />
    </lr-stick-bar>
    <lr-stick-bar title="板块热度" width="600" top="200px">
      <concept-heat />
    </lr-stick-bar>
    <lr-stick-bar title="个股热度" width="600" top="260px">
      <stock-heat />
    </lr-stick-bar>
  </div>
</template>

<script>
import threePhase from './analyzeModel/threePhase.vue'
import customAnalyze from './analyzeModel/customAnalyze.vue'
import conceptHeat from './analyzeModel/conceptHeat.vue'
import stockHeat from './analyzeModel/stockHeat.vue'

export default {
  components: {
    threePhase,
    customAnalyze,
    conceptHeat,
    stockHeat
  }
}
</script>
