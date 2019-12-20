<template>
  <div>
    <custom-event />
    <stock-detail-panel />
    <news-panel />
    <notification-daemon />
    <global-button />
    <theme-market />
    <message-live />
    <article-reader />
    <data-source />
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
import dataSource from './dataSource/index.vue'

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
    dataSource
  }
}
</script>
