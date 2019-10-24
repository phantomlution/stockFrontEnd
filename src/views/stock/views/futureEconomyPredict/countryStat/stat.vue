<template>
  <lr-box :title="title">
    <lr-chart ref="chart" />
  </lr-box>
</template>

<script>
const props = {
  item: {
    type: Object,
    required: true
  }
}

export default {
  props,
  data() {
    return {
      name: '',
      unit: ''
    }
  },
  computed: {
    title() {
      let result = this.name
      if (this.unit.length > 0) {
        result += `(${this.unit})`
      }
      return result
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    loadData() {
      const code = this.item.code
      this.$http.get('/api/data/stat/country', {
        code
      }).then(result => {
        this.name = result.name
        this.unit = result.unit
        this.renderChart(result)
      }).catch(_ => {
        console.log(_)
      })
    },
    renderChart(raw) {
      const chart = this.$refs.chart.getChart()
      raw.list.reverse()
      chart.source(raw.list.filter(item => item.value > 0))
      chart.line().position('date*value')
      chart.render()

    }
  }
}
</script>
