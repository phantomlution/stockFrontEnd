<template>
  <analyze-wrapper :analyzePromise="startAnalyze">
  </analyze-wrapper>
</template>

<script>
import analyzeWrapper from './analyzeWrapper.vue'

export default {
  components: {
    analyzeWrapper
  },
  methods: {
    startAnalyze() {
//      return this.$http.get('/api/analyze/custom')
      return this.getFileResource()
    },
    getFileResource() { // 加载远端文件数据源
      const baseDir = '/api/static/analyze/'
      const fileName = '二次限售解禁分析.json'
      return this.$http.get(baseDir + fileName).then(rawData => {
        return rawData
//        console.log(rawData)
//        return JSON.parse(rawData)
      })
    }
  }
}
</script>
