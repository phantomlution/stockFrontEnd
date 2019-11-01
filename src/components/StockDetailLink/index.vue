<template>
  <div style="display: inline-block">
    <el-link type="primary" @click.stop="showStockDetail">{{ name }}({{ code }})</el-link>
    <lr-shopping-cart :code="code" v-if="add" />
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
    required: true
  },
  add: { // 所以的添加功能
    type: Boolean,
    default: false
  }
}
export default {
  name: 'LrStockDetailLink',
  props,
  data() {
    return {
    }
  },
  methods: {
    showStockDetail() {
      const code = this.code
      this.$bus.$emit('showStockDetail', code)
    }
  }
}
</script>
