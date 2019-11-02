<template>
  <div>
    <div>
      <search-stock v-model="stockCode"/>
      <el-date-picker v-model="date" style="width: 160px"/>

      <el-button type="primary" @click.stop="loadData">查看</el-button>
    </div>
    <div>
      <div slot="title">
      </div>
      <lr-chart ref="chart" />
    </div>
  </div>
</template>

<script>
import searchStock from '@/views/stock/components/searchStock'
import { addStockDailyCoordinate, STOCK_COORDINATE_DATE } from '@/utils/ChartUtils'
import moment from 'moment'
import lodash from 'lodash'

export default {
  components: {
    searchStock
  },
  data() {
    return {
      stockCode: '',
      date: '',
    }
  },
  methods: {
    loadData() {
      if (!this.stockCode) {
        return this.$message.error('请选择代码')
      }
      if (!this.date) {
        return this.$message.error('请选择日期')
      }
      const code = this.stockCode.substring(2)
      const date = moment(this.date).format('YYYY-MM-DD')

      this.$http.get('/api/analyze/history/fragment/trade', {
        code,
        date
      }).then(tradeList => {
        if (!tradeList) {
          tradeList = []
        }
        this.renderChart(tradeList)
      }).catch(_ => {
        console.error(_)
      })
    },
    renderChart(tradeList) {
      const chart = this.$refs.chart.getChart()
      if (tradeList.length === 0) {
        return this.$message.warning('没有找到对应的数据')
      }
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

      const yesterdayClose = tradeList[0].price - tradeList[0].change

      chart.source(displayDataList)
      addStockDailyCoordinate(chart)

      // 添加辅助线
      this.addAssistantLine(chart, yesterdayClose, `昨收 ${ yesterdayClose }`)

      // 添加幅度变化辅助线
      for(let i=1; i<= 10; i++) {
        this.addAssistantLine(chart, lodash.round(yesterdayClose * (1 + 0.01 * i), 2), `${ i }%`)
        this.addAssistantLine(chart, lodash.round(yesterdayClose * (1 - 0.01 * i), 2), `-${ i }%`)
      }




      chart.line().position('time*value')
      chart.render()
    },
    addAssistantLine(chart, value, text) { // 添加价格辅助线
      chart.guide().line({
        start: {
          time: 'min',
          value: value
        },
        end: {
          time: 'max',
          value: value
        },
        text: {
          position: 'end',
          content: `       ${ text}`
        }
      })

    }
  }
}

</script>
