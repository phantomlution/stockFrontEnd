<template>
  <el-select v-model="stockCode" filterable :filter-method="throttleSearch" v-show="true">
    <el-option v-for="item in filteredStockList" :key="item.value" :label="`(${ item.label}) ${ item.value }`" :value="item.value"></el-option>
  </el-select>
</template>

<script>
import stockUtils from '@/utils/stockUtils'
import lodash from 'lodash'

const props = {
  value: {
    type: String,
    default: ''
  }
}
export default {
  props,
  data() {
    return {
      stockCode: this.value,
      throttleSearch: null,
      filteredStockList: []
    }
  },
  computed: {
    stockList() {
      return this.$store.state.data.codeList
    }
  },
  watch: {
    value(val) {
      this.stockCode = val
    },
    stockCode(val) {
      this.$emit('input', val)
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
    getCurrent() {
      if (!this.stockCode) {
        return null
      } else {
        return this.stockList.find(item => item.value === this.stockCode)
      }
    },
    searchStockItem(query) {
      if (!query) {
        this.filteredStockList = lodash.take(this.stockList, 10)
        return
      }

      console.log(this.stockList)
      this.stockList.forEach(item => {
        if (!item.label) {
          console.error(item)
        }
      })

      this.filteredStockList = lodash.take(this.stockList.filter(item => {
        return item.label.indexOf(query) !== -1 || item.value.indexOf(query) !== -1
      }), 10)
    }
  }
}
</script>
