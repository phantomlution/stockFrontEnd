<!-- 用于批量分析股票集的某一天走势 -->

<template>
  <div>
    <k-line ref="chart" @dblclick="showDetail" />
  </div>
</template>

<script>
import { increment } from '@/utils'

export default {
  data() {
    return {
      date: null,
      stockList: []
    }
  },
  watch: {
    date() {
      this.loadData()
    }
  },
  methods: {
    loadTodayData() { // 加载今日数据

    },
    loadHistoryData(stockList, date) { // 加载历史数据
      const targetDate = this.$moment(date).format('YYYY-MM-DD')
      return new Promise((resolve, reject) => {
        Promise.all(stockList.map(item => this.$store.dispatch('loadStockData', item.code))).then(_ => {
          const chartDataList = []

          _.forEach(item => {
            const model = {
              "name": item.name,
              "code": item.code,
            }
            const currentItem = item.result.find(resultItem => resultItem.date === targetDate)
            if (!currentItem) {
              return this.$message.warning('找不到数据点')
            }

            const close = currentItem.yesterdayClose
            model.open = increment(currentItem.open, close)
            model.max = increment(currentItem.max, close)
            model.min = increment(currentItem.min, close)
            model.close = increment(currentItem.close, close)
            model.volume = currentItem.volume || 100
            model.amount = currentItem.amount
            model.date = targetDate

            chartDataList.push(model)
          })

          resolve(chartDataList)
        }).catch(_ => {
          reject(_)
        })
      })
    },
    loadData(conceptModel, stockList, date) {
      this.loadHistoryData(stockList, date).then(chartDataList => {
        chartDataList.forEach((item, itemIndex) => {
          item.date = itemIndex + 1
        })

        this.renderChart(chartDataList)
      }).catch(_ => {
        this.$message.error(_)
      })
    },
    renderChart(dataList) {
      const chart = this.$refs.chart
      chart.renderChart(dataList, {
        scale: {
          date: {
            type: 'linear',
            nice: false,
            tickInterval: 1
          },
        }
      })
    },
    showDetail(meta) {
      const code = meta.data.code
      this.$bus.$emit('showStockDetail', {
        code
      })
    }
  }
}
</script>
