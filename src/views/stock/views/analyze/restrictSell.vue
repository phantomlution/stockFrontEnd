<template>
  <div>
    <lr-chart ref="chart" />
  </div>
</template>

<script>
export default {
  data() {
    return {

    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    loadData() {
      this.$http.get(`/api/analyze/restrict_sell`).then(result => {
        this.renderChart(result)
      }).catch(_ => {

      })
    },
    renderChart(dateList) {
      const data = dateList.map(item => {
        return {
          date: item.date,
          count: item.itemList.length
        }
      })
      data.sort((former, later) => {
        return later.count - former.count
      })

      const chart = this.$refs.chart.getChart()
      chart.source(data)
      chart.line().position('date*count')
      chart.render()
    }
  }
}
</script>
