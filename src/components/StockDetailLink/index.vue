<template>
  <el-link type="primary" @click.stop="showStockDetail">{{ name }}</el-link>
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
  }
}
export default {
  name: 'LrStockDetailLink',
  props,
  methods: {
    showStockDetail() {
      const code = this.code
      this.$bus.$emit('showStockDetail', code)
    }
  }
}
</script>
