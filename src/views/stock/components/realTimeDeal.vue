<template>
  <div>
    <stock-price-chart ref="stockPrice" :padding="padding" :height="height" :lightMode="lightMode" />
  </div>
</template>

<script>
import scheduleMixin, { STOP_CALLBACK_FOR_STOCK } from '@/mixins/schedule'
import { STOCK_COORDINATE_DATE } from '@/utils/ChartUtils'
import stockPriceChart from './stockPriceChart.vue'
import { $moment, increment } from '@/utils'
import lodash from 'lodash'

const props = {
  code: {
    type: String,
    required: true
  },
  height: {
    Number
  },
  yesterdayClose: {
    type: Number
  },
  yesterdayAmount: {
    type: Number,
    default: 0
  },
  lightMode: { // 是否使用轻量化模式，节省页面空间
    type: Boolean,
    default: false
  },
  duration: { // 更新间隔
    type: Number,
    default: 5
  },
  padding: {
    type: Array
  }
}

// 计算早盘和午盘
const pointList = [];
[`${ STOCK_COORDINATE_DATE} 09:30:00`, `${ STOCK_COORDINATE_DATE } 13:00:00`].forEach(startTime => {
  for (let i=0; i<= 120; i++) {
    pointList.push({
      time: $moment(startTime).add(i, 'minutes').format('HH:mm:ss'),
      price: null
    })
  }
})

export default {
  props,
  components: {
    stockPriceChart
  },
  mixins: [scheduleMixin],
  mounted() {
    this.loadData()

    // 请求分流，缓解目前后台的压力
    const randomMilliSeconds = parseInt(Math.random() * (15 * 1000), 10)
    setTimeout(_ => {
      this.startSchedule(this.loadData, this.duration, STOP_CALLBACK_FOR_STOCK)
    }, randomMilliSeconds)
  },
  watch: {
    duration(val) { // 更新频率
      this.startSchedule(this.loadData, val, STOP_CALLBACK_FOR_STOCK)
    }
  },
  methods: {
    loadData() {
      this.$http.get(`/api/stock/live`, {
        code: this.code
      }).then(dataList => {
        this.updateStatInfo(dataList)
        // 补全数据
        if (dataList.length === 0) {
          Array.prototype.push.apply(dataList, pointList)
        } else {
          Array.prototype.push.apply(dataList, pointList.filter(item => item.time > dataList[dataList.length - 1].time))
        }


        this.$refs.stockPrice && this.$refs.stockPrice.updateChart(dataList, this.yesterdayClose)
      })
    },
    updateStatInfo(dataList) {
      if (!this.yesterdayClose || dataList.length === 0) {
        return null
      }
      const statModel = { // 统计信息
        price: dataList[dataList.length - 1].price,
        amount: lodash.sumBy(dataList, item => item.amount),
        max: lodash.maxBy(dataList, item => item.price)['price'],
        min: lodash.minBy(dataList, item => item.price)['price']
      }
      if (statModel.price) {
        statModel.priceDiff = increment(statModel.price, this.yesterdayClose)
        statModel.maxDiff = increment(statModel.max, this.yesterdayClose)
        statModel.minDiff = increment(statModel.min, this.yesterdayClose)
      }

      statModel.amountPercent = null
      if (this.yesterdayAmount) {
        statModel.amountPercent = lodash.round(statModel.amount / this.yesterdayAmount * 100, 0)
      }
      this.$emit('statChange', statModel)
    }
  }
}
</script>
