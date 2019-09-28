<template>
  <div>
    <el-button type="primary" @click.stop="analyze">开始分析</el-button>
    <lr-box style="margin-top: 8px">
      <lr-chart ref="chart" />
    </lr-box>
  </div>
</template>

<script>
import stockUtils from '@/utils/stockUtils'

export default {
  data() {
    return {
      dataList: []
    }
  },
  mounted() {
    this.analyze()
  },
  methods: {
    analyze() {
    }
  }
}
</script>
