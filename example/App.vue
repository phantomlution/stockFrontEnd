<template>
  <div id="app">
    <el-tabs>
      <el-tab-pane label="detail">
        <stock-detail />
      </el-tab-pane>
      <el-tab-pane label="analyze">
        <stock-analyze />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import stockDetail from '@/views/stock/detail'
import stockAnalyze from '@/views/stock/analyze'

export default {
  components: {
    stockDetail,
    stockAnalyze
  }
}
</script>
