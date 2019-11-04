<template>
  <div style="display: inline-block">
    <el-link type="primary" @click.stop="showStockDetail">{{ name }}{{ codeLabel }}</el-link>
    <lr-shopping-cart :code="code" v-if="add" :buttonText="addText" />
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
  addText: {
    type: String,
    default: '加自选'
  },
  defaultTab: {
    type: String,
    default: ''
  }
}
export default {
  name: 'LrStockDetailLink',
  props,
  computed: {
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
