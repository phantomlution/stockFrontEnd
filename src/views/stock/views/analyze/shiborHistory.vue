<template>
  <lr-box :title="title">
    <lr-chart ref="chart"></lr-chart>
  </lr-box>
</template>

<script>
const DATE_FORMAT = 'YYYY-MM-DD'

export default {
  data() {
    return {
      start: '2018-01-01',
      end: this.$moment().format(DATE_FORMAT)
    }
  },
  computed: {
    title() {
      return `${ this.start } 至 ${ this.end } shibor走势`
    }
  },
  mounted() {
    Promise.all(
      this.getDateRangeList().map(range => this.getHistoryData(range.start, range.end))
    ).then(responseList => {
      const totalRecords = []
      responseList.forEach(records => {
        Array.prototype.push.apply(totalRecords, records)
      })
      this.renderChart(totalRecords)
    })

  },
  methods: {
    getDateRangeList() {
      let start = this.start
      let end = this.end
      const range = []
      // 将日期区间拆解成多个子区间，每个区间小于1年
      let startDate = this.$moment(start)
      const endDate = this.$moment(end)
      while(this.$moment(startDate).add(365, 'days').toDate().getTime() < endDate.toDate().getTime()) {
        range.push({
          start: startDate.format(DATE_FORMAT),
          end: this.$moment(startDate).add(365 - 1, 'days').format(DATE_FORMAT)
        })
        startDate = this.$moment(startDate).add(365, 'days')
      }
      range.push({
        start: startDate.format(DATE_FORMAT),
        end: endDate.format(DATE_FORMAT)
      })

      return range
    },
    getHistoryData(start, end) {
      return new Promise((resolve, reject) => {
        this.$http.get(`/api/data/shibor`, {
          start,
          end
        }).then(result => {
          const records = result.records
          records.reverse()
          resolve(records)
        }).catch(_ => {
          reject(_)
        })
      })
    },
    renderChart(totalRecords) {
      const chart = this.$refs.chart.getChart()
      const chartData = []
      // 考虑的报价方式['ON', '1W', '2W', '1M', '3M', '6M', '9M', '1Y']
      const displayKey = ['ON', '1W', '2W', '1M', '1Y']
      // 生成数据
      totalRecords.forEach(record => {
        displayKey.forEach(key => {
          chartData.push({
            value: Number(record[key]),
            type: key,
            date: record['showDateCN']
          })
        })
      })

      chart.source(chartData)
      chart.line().position('date*value').color('type')
      chart.legend(true)
      chart.render()
    }
  }
}
</script>
