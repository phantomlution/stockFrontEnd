<template>
  <lr-box :title="themeName">
    <div :id="chartId"></div>
  </lr-box>
</template>

<script>
import moment from 'moment'
import stockUtils from '@/utils/stockUtils'
import { idGenerator } from '@/utils'
import G2 from '@antv/g2'
import lodash from 'lodash'

export default {
  data() {
    return {
      themeName: '',
      startDaysDiff: -1 * 60,
      chart: null,
      chartId: idGenerator.next()
    }
  },
  methods: {
    loadTrend(themeName, codeList) {
      this.themeName = themeName
      const stockMap = this.$store.state.data.stockMap
      const validCodeList = codeList.filter(item => item.label.length > 0)
      // 计算动态增长率
      // 性能稍微差一点，可以接受
      const result = []
      for(let i=this.startDaysDiff; i<=0; i++) {
        const percentList = []
        const date = moment().add('days', i).toDate()
        const dateString = stockUtils.dateFormat(date)
        const timestamp = moment(dateString).toDate().getTime()
        validCodeList.forEach(codeItem => {
          let stock = stockMap.get(codeItem.value)
          if (stock) {
            let targetDateItem = stock.rawData.find(item => item.timestamp === timestamp)
            if (targetDateItem) {
              percentList.push(targetDateItem.percent)
            }
          }
        })
        if (percentList.length > 0) {
          result.push({
            date: dateString,
            value: lodash.mean(percentList)
          })
        }
      }
      this.updateChart(result)
    },
    updateChart(data) {
      if (this.chart) {
        this.chart.clear()
      } else {
        this.chart = new G2.Chart({
          container: this.chartId,
          forceFit: true,
          width: window.innerWidth,
          height: window.innerHeight * 0.75,
          padding: [20, 80, 80, 80]
        })
      }
      const chart = this.chart

      const chartData = data

      chart.source(chartData)
      chart.tooltip({
        crosshairs: {
          type: 'line'
        }
      });
      chart.line().position('date*value')
      chart.render()
    }
  }
}
</script>
