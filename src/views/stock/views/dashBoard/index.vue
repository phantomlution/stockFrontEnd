<template>
  <div>
    <div style="display: flex">
      <div style="flex: 1">
        <searchStock v-model="stockCode" ref="searchStock" />
        <lr-shopping-cart :code="stockCode" v-if="stockCode" style="margin-left: 8px"/>
        <risk-detector style="margin-left: 72px" ref="riskDetector" />
      </div>
    </div>
    <div style="margin-top: 16px;display: grid;grid-template-columns: 1fr 1fr 1fr;grid-row-gap: 8px; grid-column-gap: 16px;">
      <stock-tracker @removeItem="removeItem(itemIndex)" :code="item.code" :name="item.name" :item="item" v-for="(item, itemIndex) of stockPool" :key="itemIndex"></stock-tracker>
    </div>
    <div style="margin-top: 16px;margin-bottom: 8px;">
      <template v-if="!showNotice">
        <el-button type="primary" size="large" style="width: 100%" @click.stop="showNotice=true">展开公告</el-button>
      </template>
      <template v-else>
        <all-stock-notice :stock-list="stockPool" />
      </template>
    </div>
  </div>
</template>

<script>
import stockTracker from './stockTracker.vue'
import searchStock from '@/views/stock/components/searchStock'
import allStockNotice from './allStockNotice.vue'
import riskDetector from './riskDetector.vue'

export default {
  components: {
    stockTracker,
    searchStock,
    allStockNotice,
    riskDetector
  },
  data() {
    return {
      stockCode: '',
      stockPool: [],
      showNotice: false
    }
  },
  computed: {
    riskDetector() {
      return this.$refs.riskDetector
    }
  },
  mounted() {
    this.loadStockPool()
  },
  methods: {
    refresh() {
      this.loadStockPool()
    },
    loadStockPool() {
      this.$http.get(`/api/stock/pool`).then(_ => {
        // 执行强检测任务
        Promise.all(_.map(item => this.detectRisk(item))).then(stockPoolList => {
          this.stockPool = stockPoolList
          // 收集相关信息
          this.riskDetector.collect(stockPoolList)
        }).catch(_ => {
          console.error(_)
        })
      }).catch(_ => {
        console.log(_)
      })
    },
    detectRisk(stockPoolItem) { // 风险检测
      return new Promise((resolve, reject) => {
        this.riskDetector.detect(stockPoolItem.code).then(riskList => {
          stockPoolItem.riskList = riskList
          resolve(stockPoolItem)
        }).catch(_ => {
          reject(_)
        })
      })
    },
    removeItem(tagIndex) {
      const item = this.stockPool[tagIndex]
      const code = item['code']

      this.$http.delete('/api/stock/pool', { code }).then(_ => {
        this.refresh()
      }).catch(_ => {
        console.log(_)
      })
    }
  }
}
</script>
