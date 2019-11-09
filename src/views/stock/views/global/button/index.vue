<template>
  <div class="lr-global-button">
    <el-button size="small" circle icon="el-icon-shopping-cart-1" @click.stop="openThemeMarket"/>
    <el-badge :max="999" :value="newsCount" :hidden="newsCount === 0">
      <el-button size="small" circle icon="el-icon-reading" @click.stop="openNews" />
    </el-badge>
  </div>
</template>

<script>
export default {
  data() {
    return {
      newsCount: 0
    }
  },
  beforeDestroy() {
    this.$bus.$off('update_news_count')
  },
  mounted() {
    this.$bus.$on('update_news_count', count => {
      this.newsCount = count
    })
  },
  methods: {
    openThemeMarket() {
      this.$bus.$emit('openThemeMarket')
    },
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
