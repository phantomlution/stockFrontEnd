<template>
  <div>
    <stock-price-chart ref="stockPrice" :height="height" />
  </div>
</template>

<script>
import scheduleMixin, { STOP_CALLBACK_FOR_STOCK } from '@/mixins/schedule'
import { STOCK_COORDINATE_DATE } from '@/utils/ChartUtils'
import stockPriceChart from './stockPriceChart.vue'
import { $moment } from '@/utils'

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
    this.startSchedule(this.loadData, 5, STOP_CALLBACK_FOR_STOCK)
  },
  methods: {
    loadData() {
      this.$http.get(`/api/stock/live`, {
        code: this.code
      }).then(dataList => {
        // 补全数据
        if (dataList.length === 0) {
          Array.prototype.push.apply(dataList, pointList)
        } else {
          Array.prototype.push.apply(dataList, pointList.filter(item => item.time > dataList[dataList.length - 1].time))
        }

        this.$refs.stockPrice && this.$refs.stockPrice.updateChart(dataList, this.yesterdayClose)
      })
    }
  }
}
</script>
