<template>
  <div class="lr-global-button">
    <event-calendar style="margin-right: 10px" />
    <data-source-button style="margin-right: 10px"/>
    <el-button size="small" circle icon="el-icon-collection" @click.stop="openEventPanel"></el-button>
    <el-button size="small" circle icon="el-icon-shopping-cart-1" @click.stop="openThemeMarket"></el-button>
    <el-badge :max="999" :value="newsCount" :hidden="newsCount === 0" style="margin-left: 10px">
      <el-button size="small" circle icon="el-icon-reading" @click.stop="openNews"></el-button>
    </el-badge>
  </div>
</template>

<script>
import dataSourceButton from '../dataSource/index.vue'
import eventCalendar from '../calendar/index.vue'

export default {
  components: {
    dataSourceButton,
    eventCalendar
  },
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
    },
    openEventPanel() {
      this.$bus.$emit('openEventPanel')
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
