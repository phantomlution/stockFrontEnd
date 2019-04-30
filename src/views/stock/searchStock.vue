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
      throttleSearch: null,
      stockList: [],
      filteredStockList: []
    }
  },
  watch: {
    stockCode(val) {
      this.$emit('change', val)
    }
  },
  mounted() {
    this.throttleSearch = lodash.throttle(this.searchStockItem, 50)
  },
  destroyed() {
    this.throttleSearch = null
  },
  methods: {
    doInit(codeList) {
      this.stockList = codeList
    },
    searchStockItem(query) {
      if (!query) {
        this.filteredStockList = lodash.take(this.stockList, 10)
        return
      }
      this.filteredStockList = lodash.take(this.stockList.filter(item => {
        return item.label.indexOf(query) !== -1 || item.value.indexOf(query) !== -1
      }), 10)
    }
  }
}
</script>
