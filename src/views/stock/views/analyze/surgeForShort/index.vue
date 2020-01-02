<template>
  <lr-box>
    <div>
      <el-date-picker @change="getMarketSurgeForShort" v-model="date" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期">
      </el-date-picker>
    </div>
    <div>
      <lr-chart ref="chart" />
    </div>
  </lr-box>
</template>

<script>
import lodash from 'lodash'

export default {
  data() {
    return {
      date: [new Date(), new Date()]
    }
  },
  methods: {
    getDateList() {
      const result = []
      const start = this.$moment(this.date[0]).format('YYYY-MM-DD')
      const end = this.$moment(this.date[1]).format('YYYY-MM-DD')

      const days = this.$moment(end).diff(this.$moment(start), 'days') + 1

      for(let i=0; i<days; i++) {
        result.push(this.$moment(start).add(i, 'days').format('YYYY-MM-DD'))
      }

      return result
    },
    normalization(itemList) {
      return itemList.map(item => {
        return {
          date: item.date,
          percent: lodash.round(item.short.length / item.total * 100, 1),
          shortCount: item.short.length,
          short: item.short,
          total: item.total
        }
      })
    },
    getMarketSurgeForShort() {
      this.$http.post(`/api/analyze/market/surge_for_short`, this.getDateList()).then(result => {
        this.renderChart(this.normalization(result))
      }).catch(_ => {
        console.error(_)
      })
    },
    renderChart(dataList) {
      const chart = this.$refs.chart.getChart()

      chart.source(dataList)
      chart.line().position('date*percent').tooltip('date*percent*shortCount*total')
      chart.render()
    }
  }
}
</script>
