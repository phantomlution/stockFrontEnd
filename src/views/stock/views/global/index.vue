<template>
  <div>
    <column-panel />
    <stock-detail-panel />
    <news-panel />
    <notification-daemon />
    <global-button />
    <theme-market />
    <message-live />
  </div>
</template>

<script>
import columnPanel from './columnPanel'
import stockDetailPanel from './stockDetailPanel'
import newsPanel from './news/index'
import notificationDaemon from './notification/index'
import globalButton from './button/index'
import themeMarket from './themeMarket/index'
import messageLive from './live/index.vue'

export default {
  components: {
    columnPanel,
    stockDetailPanel,
    newsPanel,
    notificationDaemon,
    globalButton,
    themeMarket,
    messageLive
  }
}
</script>
