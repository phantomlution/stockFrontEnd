<template>
  <div>
    <product-price-chart ref="chart" />
  </div>
</template>

<script>
import productPriceChart from '@/views/stock/chart/productPrice'

const props = {
  goodsId: {
    type: String,
    default: ''
  }
}

export default {
  props,
  components: {
    productPriceChart
  },
  data() {
    return {

    }
  },
  watch: {
    goodsId(val) {
      if (!isNaN(val)) {
        this.updateIndex()
      }
    }
  },
  methods: {
    updateIndex() {
      const goodsId = this.goodsId
      const marketPriceMap = this.$store.state.data.marketPriceMap
      const cache = marketPriceMap.get(goodsId)
      if (cache) {
        this.updateChart(cache)
      } else {
        this.$http.get('/api/product/farm', {
          goodsId: goodsId === '0' ? '' : goodsId
        }).then(response => {
          let result = response.data
          marketPriceMap.set(goodsId, result)
          this.updateChart(result)
        }).catch(err => {
          console.error(err)
        })
      }
    },
    updateChart(result) {
      console.log(result)
      // 生成图数据
      const chartData = []
      result.items.forEach(item => {
        let date = item.indexDate
        chartData.push({
          date,
          value: item.indexNum,
          type: 'today'
        })
        chartData.push({
          date,
          value: item.thirtyIndexNum,
          type: 'three'
        })
        chartData.push({
          date,
          value: item.quinticIndexNum,
          type: 'month'
        })
      })
      this.$refs.chart.updateChart(chartData)
    }
  }
}
</script>
