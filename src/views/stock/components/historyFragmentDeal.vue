<template>
  <lr-box style="margin-top: 16px" v-if="stockCode">
    <div slot="title">
      <search-stock v-model="stockCode" @change="checkAndLoad" v-if="!code"/>
      <lr-date-picker v-model="date" @change="checkAndLoad" pattern="stock" />
      <lr-stock-detail-link :code="stockCode" :add="false" defaultTab="trendAnalyze" />
      <span v-if="date" style="font-size: 14px;color: rgba(0, 0, 0, 0.65)">
        {{ date | date }}
      </span>
    </div>
    <div>
      <lr-chart ref="chart" />
    </div>
    <div>
      <lr-chart ref="amountChart" />
    </div>
  </lr-box>
</template>

<script>
import searchStock from '@/views/stock/components/searchStock'
import { addStockDailyCoordinate, STOCK_COORDINATE_DATE, COORDINATE_TIME_LIST } from '@/utils/ChartUtils'
import moment from 'moment'
import lodash from 'lodash'

const props = {
  code: { // 指定代码
    type: String,
    default: ''
  },
  token: { // 是否接收更新事件
    type: String,
    default: ''
  }
}
export default {
  props,
  components: {
    searchStock
  },
  data() {
    return {
      stockCode: this.code,
      distributionList: [],
      date: '',
    }
  },
  watch: {
    code(val) {
      this.date = ''
      this.stockCode = val
    },
    date(val) {
      if (!val) {
        const chart = this.$refs.chart.getChart()
        const amountChart = this.$refs.amountChart.getChart()

        chart.clear()
        amountChart.clear()
      }
    }
  },
  mounted() {
    if (this.code) {
      this.date = this.$moment().add('days', -1).toDate()
    }
    if (this.token) {
      this.$bus.$on(this.token, item => {
        if (item.code !== this.stockCode) {
          this.$message.error('序号不匹配')
          return
        }
        this.date = this.$moment(item.date).toDate()
      })
    }
  },
  beforeDestroy() {
    this.$bus.$off(this.token)
  },
  methods: {
    checkAndLoad() {
      if (this.stockCode && this.date) {
        this.loadData()
      }
    },
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
        this.calculateDistribution(tradeList)
      }).catch(_ => {
        console.error(_)
      })
    },
    calculateDistribution(tradeList) {
      this.distributionList = []
      const totalVolume = lodash.sum(tradeList.map(item => item.volume))
      for (let i=2; i<=10; i++) {
        let targetVolume = totalVolume / i
        let tempTotalVolume = 0
        for(let j=0; j<tradeList.length; j++) {
          tempTotalVolume += tradeList[j].volume
          if (tempTotalVolume >= targetVolume) {
            this.distributionList.push({
              volume: `1/${i}`,
              time: tradeList[j].time
            })
            break
          }
        }
      }
    },
    renderChart(tradeList) {
      const chart = this.$refs.chart.getChart()
      const amountChart = this.$refs.amountChart.getChart()

      if (tradeList.length === 0) {
        return this.$message.warning('没有找到对应的数据')
      }
      const dataList = tradeList.map(item => {
        return {
          time: `${ STOCK_COORDINATE_DATE } ${ item.time }`,
          value: item.price,
          amount: item.amount
        }
      })

      // 补齐坐标轴可能缺失的数据点
      const missingPoint = []
      COORDINATE_TIME_LIST.forEach(time_string => {
        const isExisted = dataList.find(item => item.time === time_string)
        if (!isExisted) { // 补齐
          // 找到上一个时间点的价格
          let lastItem = null
          for (let i=0; i<dataList.length; i++) {
            if (!lastItem) {
              lastItem = dataList[i]
              continue
            }
            let diff = moment(time_string).diff(moment(dataList[i].time))
            if (diff >= 0) {
              lastItem = dataList[i]
              continue
            } else {
              break
            }
          }
          if (lastItem) {
            missingPoint.push({
              time: time_string,
              value: lastItem['value'],
              amount: 0
            })
          }
        }
      })

      Array.prototype.push.apply(dataList, missingPoint)


      const yesterdayClose = lodash.round(tradeList[0].price - tradeList[0].change, 2)

      chart.source(dataList)
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

      // 绘制成交量
      const duplicateDataList = dataList.map(item => item)
      duplicateDataList.sort((former, later) => {
        return former.amount - later.amount
      })
      const renderDataList = lodash.takeRight(duplicateDataList, 10)

      amountChart.source(renderDataList)
      addStockDailyCoordinate(amountChart)
      amountChart.interval().position('time*amount')
      amountChart.render()
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
