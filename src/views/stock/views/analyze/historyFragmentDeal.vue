<template>
  <div>
    <div>
      <search-stock v-model="stockCode"/>
      <el-button type="primary" @click.stop="loadData">查看</el-button>
    </div>
    <div>
      <lr-chart ref="chart" />
    </div>
  </div>
</template>

<script>
import searchStock from '@/views/stock/components/searchStock'
import { addStockDailyCoordinate, STOCK_COORDINATE_DATE } from '@/utils/ChartUtils'
import moment from 'moment'

export default {
  components: {
    searchStock
  },
  data() {
    return {
      stockCode: '',

    }
  },
  methods: {
    loadData() {
      const code = '600848'
      const date = '2019-11-01'
      this.$http.get('/api/analyze/history/fragment/trade', {
        code,
        date
      }).then(tradeList => {
        this.renderChart(tradeList)
      }).catch(_ => {
        console.error(_)
      })
    },
    renderChart(tradeList) {
      const chart = this.$refs.chart.getChart()
      const dataList = tradeList.map(item => {
        // 抹掉秒
        let oldTimeList = item.time.split(':')
        return {
          time: moment(`${ STOCK_COORDINATE_DATE } ${ oldTimeList[0] }:${ oldTimeList[1] }:00`).toDate().getTime(),
          value: item.price
        }
      })

      // 拆分数据为早上和下午两部分
      const separateTime = moment(`${ STOCK_COORDINATE_DATE } 12:00:00`).toDate().getTime()

      const morningDataList = dataList.filter(item => item.time <= separateTime).map(item => {
        return {
          time: moment(item.time).format('YYYY-MM-DD HH:mm:ss'),
          value: item.value
        }
      })

      const afternoonDateList = dataList.filter(item => item.time >= separateTime).map(item => {
        return {
          time: moment(item.time).format('YYYY-MM-DD HH:mm:ss'),
          value: item.value
        }
      })

      // 修复早盘最后一个数据点
      const lastMorningPoint = morningDataList[morningDataList.length - 1]
      if (morningDataList.time !== `${ STOCK_COORDINATE_DATE } 11:30:00`) {
        morningDataList.push({
          time: `${ STOCK_COORDINATE_DATE } 11:30:00`,
          value: lastMorningPoint.value
        })
      }

      const displayDataList = []
      Array.prototype.push.apply(displayDataList, morningDataList.filter((item, itemIndex) => itemIndex === morningDataList.findIndex(subItem => subItem.time === item.time)))
      Array.prototype.push.apply(displayDataList, afternoonDateList.filter((item, itemIndex) => itemIndex === afternoonDateList.findIndex(subItem => subItem.time === item.time)))

      console.log(displayDataList)
      chart.source(displayDataList)
      addStockDailyCoordinate(chart)

      chart.line().position('time*value')
      chart.render()
    }
  }
}

</script>
