<template>
  <div>
    <!-- 做一些临时试验 -->
    <playground />
    <custom-event />
    <stock-detail-panel />
    <news-panel />
    <notification-daemon />
    <global-button />
    <theme-market />
    <message-live />
    <article-reader />
  </div>
</template>

<script>
import stockDetailPanel from './stockDetail/index.vue'
import newsPanel from './news/index'
import notificationDaemon from './notification/index'
import globalButton from './button/index'
import themeMarket from './themeMarket/index'
import messageLive from './live/index.vue'
import customEvent from './customEvent/index.vue'
import articleReader from './article/index.vue'
import playground from './playground/index.vue'

export default {
  components: {
    stockDetailPanel,
    newsPanel,
    notificationDaemon,
    globalButton,
    themeMarket,
    messageLive,
    customEvent,
    articleReader,
    playground
  },
  mounted() {
    /**
     * 数据初始化
     */
    // 加载股票代码表
    this.$store.dispatch('getStockCodeList')
    // 加载自选股票池
    this.$store.dispatch('getStockPoolList')
    // 加载最近的市场交易日
    this.$store.dispatch('getRecentTradeDateList')
  }
}
</script>
