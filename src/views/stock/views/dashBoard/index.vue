<template>
  <div>
    <div style="display: flex">
      <div style="flex: 1">
        <searchStock v-model="stockCode" ref="searchStock" />
        <el-button type="primary" @click.stop="addToPool">添加</el-button>
        <risk-detector style="margin-left: 72px" ref="riskDetector" />
      </div>
    </div>
    <div style="margin-top: 16px;display: grid;grid-template-columns: 1fr 1fr 1fr;grid-row-gap: 8px; grid-column-gap: 16px;">
      <stock-tracker @removeItem="removeItem(itemIndex)" :code="item.code" :name="item.name" v-for="(item, itemIndex) of stockPool" :key="itemIndex"></stock-tracker>
    </div>
    <div style="margin-top: 24px;">
      <all-stock-notice :stock-list="stockPool" />
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
      stockPool: []
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
          this.stockPool =  stockPoolList
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
    },
    addToPool() {
      const codeItem = this.$refs.searchStock.getCurrent()

      if (!codeItem) {
        this.$message.warning('请先选择股票')
        return
      }

      if (this.stockPool.find(item => item.value === codeItem.value)) {
        this.$message.error('当前股票已存在')
        return
      }

      const item = {
        name: codeItem.label,
        code: codeItem.value
      }

      this.$store.dispatch('addToStockPool', item).then(_ => {
        this.refresh()
      }).catch(_ => {
        console.log(_)
      })
    },
  }
}
</script>
