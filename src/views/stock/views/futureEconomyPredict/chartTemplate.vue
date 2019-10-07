<template>
  <div>
    <lr-chart ref="chart" />
  </div>
</template>

<script>
const props = {
  dataList: {
    type: Array,
    default() {
      return []
    }
  }
}
export default {
  props,
  watch: {
    dataList() {
      this.renderChart()
    }
  },
  mounted() {
    this.renderChart()
  },
  methods: {
    renderChart() {
      if (this.dataList.length === 0) {
        return
      }
      console.log(this.dataList)
      const chart = this.$refs.chart.getChart()
      chart.source(this.dataList)
      chart.line().position('date*value').color('type')
      chart.point().position('date*value').color('type').size(4).shape('circle').style({
        stroke: '#fff',
        lineWidth: 1
      });
      chart.render()
    }
  }
}
</script>
