<template>
  <el-select v-model="stockCode" filterable :filter-method="throttleSearch" v-show="true">
    <el-option v-for="item in filteredStockList" :key="item.value" :label="`(${ item.label}) ${ item.value }`" :value="item.value"></el-option>
  </el-select>
</template>

<script>
import stockUtils from '@/utils/stockUtils'
import lodash from 'lodash'

export default {
  data() {
    return {
      stockCode: '',
      stockList: [],
      filteredStockList: []
    }
  },
  mounted() {
    this.loadStockList()
    this.throttleSearch = lodash.throttle(this.searchStockItem, 50)
  },
  destroyed() {
    this.throttleSearch = null
  },
  methods: {
    searchStockItem(query) {
      if (!query) {
        this.filteredStockList = lodash.take(this.stockList, 10)
        return
      }
      this.filteredStockList = lodash.take(this.stockList.filter(item => {
        return item.label.indexOf(query) !== -1 || item.value.indexOf(query) !== -1
      }), 10)
    },
    loadStockList() {
      stockUtils.getCodeList().then(codeList => {
        this.stockList = codeList
      }).catch(_ => {
        this.$message.error('初始化搜索框失败')
        console.error(_)
      })
    }
  }
}
</script>
