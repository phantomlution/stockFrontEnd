<template>
  <div style="display: inline-block">
    <el-tooltip effect="dark" placement="right">
      <div slot="content" class="lr-detail-link--contextmenu">
        <div>
          <el-link @click.stop="showStockDetail('趋势分析')">趋势分析</el-link>
        </div>
        <div>
          <el-link @click.stop="showStockDetail('基础信息')">基础信息</el-link>
        </div>
        <div>
          <el-link @click.stop="showStockDetail('实时走势')">实时走势</el-link>
        </div>
        <div>
          <el-link @click.stop="showStockDetail('公告列表')">公告列表</el-link>
        </div>
        <div>
          <el-link @click.stop="showStockDetail('股票质押')">股票质押</el-link>
        </div>
        <div>
          <el-link @click.stop="showStockDetail('深度数据')">深度数据</el-link>
        </div>
        <div>
          <el-link @click.stop="showStockReport">分析报告</el-link>
        </div>
      </div>
      <el-link :type="type">{{ displayLabel }}</el-link>
    </el-tooltip>
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
    showStockDetail(tab) {
      console.log(this.code)
      const code = this.code
      this.$bus.$emit('showStockDetail', {
        code,
        tab
      })
    },
    showStockReport() {
      this.$bus.$emit('report', {
        code: this.code,
        name: this.name
      })
    }
  }
}
</script>

<style lang="scss">
.lr-detail-link--contextmenu{
  .el-link{
    & + .el-link{
      margin-right: 8px;
    }
  }

}
</style>
