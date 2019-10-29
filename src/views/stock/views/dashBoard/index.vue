<template>
  <div>
    <div>
      <searchStock v-model="stockCode" ref="searchStock" />
      <el-button type="primary" @click.stop="addToPool">添加</el-button>
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

export default {
  components: {
    stockTracker,
    searchStock,
    allStockNotice
  },
  data() {
    return {
      stockCode: '',
      stockPool: []
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
        this.stockPool =  _
      }).catch(_ => {
        console.log(_)
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
