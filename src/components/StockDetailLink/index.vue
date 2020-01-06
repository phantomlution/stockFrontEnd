<template>
  <div style="display: inline-block">
    <el-tooltip effect="dark" placement="right" v-if="false">
      <div slot="content">
        <div>
          <el-link >基础信息</el-link>
        </div>
        <div>
          <el-link >趋势分析</el-link>
        </div>
        <div>
          <el-link >实时走势</el-link>
        </div>
        <div>
          <el-link >公告列表</el-link>
        </div>
        <div>
          <el-link >股票质押</el-link>
        </div>
        <div>
          <el-link >深度数据</el-link>
        </div>
      </div>
      <el-link :type="type">{{ displayLabel }}</el-link>
    </el-tooltip>
    <el-link :type="type" @click.stop="showStockDetail">{{ displayLabel }}</el-link>
    <lr-shopping-cart :code="code" v-if="add" :icon="icon" />
  </div>
</template>

<script>
const props = {
  code: {
    type: String,
    required: true
  },
  name: {
    type: String,
    default: ''
  },
  add: { // 所以的添加功能
    type: Boolean,
    default: true
  },
  icon: {
    type: String,
  },
  defaultTab: {
    type: String,
    default: ''
  },
  showName: {
    type: Boolean,
    default: true
  },
  showCode: {
    type: Boolean,
    default: true
  },
  detectType: { // 是否自动判断是否在股票池内，调整显示的颜色
    type: Boolean,
    default: true
  }
}
export default {
  name: 'LrStockDetailLink',
  props,
  computed: {
    isInStockPool() { // 如果在股票池中，标记当前项
      const stockPoolList = this.$store.getters.stockPoolList
      return !!stockPoolList.find(item => item.code === this.code)
    },
    type() {
      if (this.detectType && this.isInStockPool) {
        return 'danger'
      }
      return 'primary'
    },
    displayLabel() {
      let label = ''
      if (this.showName) {
        label += this.name
      }
      if (this.showCode) {
        label += this.codeLabel
      }
      return label
    },
    codeLabel() {
      if (this.name === '上证指数') {
        return ''
      }
      return `(${ this.code.substring(2) })`
    }
  },
  methods: {
    showStockDetail() {
      const code = this.code
      const defaultTab = this.defaultTab
      this.$bus.$emit('showStockDetail', {
        code,
        defaultTab
      })
    }
  }
}
</script>
