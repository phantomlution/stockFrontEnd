<template>
  <div class="lr-global-button">
    <el-button size="small" circle icon="el-icon-reading" @click.stop="openNews" />
  </div>
</template>

<script>
export default {
  methods: {
    openNews() {
      this.$bus.$emit('openNewsPanel')
    }
  }
}
</script>

<style lang="scss">
.lr-global-button{
  position: fixed;
  right: 32px;
  top: 16px;
  z-index: 100
}
</style>
