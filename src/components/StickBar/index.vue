<template>
  <div :style="containerStyle">
    <el-popover placement="left" :width="width" trigger="click">
      <el-button slot="reference" type="primary">{{ title }}</el-button>
      <div>
        <slot />
      </div>
    </el-popover>
  </div>
</template>

<script>
const props = {
  title: {
    type: String,
    required: true
  },
  width: {
    type: String,
    required: true
  },
  top: {
    type: String,
    default: '32px'
  }
}
export default {
  name: 'StickBar',
  props,
  data() {
    return {
    }
  },
  computed: {
    containerStyle() {
      return {
        'position': 'fixed',
        'right': '-2px',
        'top': this.top,
        'z-index': 2000
      }
    }
  }
}
</script>

<style lang="scss">
</style>
