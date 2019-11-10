<template>
  <el-drawer direction="ltr" size="50%" :visible.sync="visible">
    <div slot="title">
      <span>新闻面板</span>
      <el-button type="text" @click.stop="loadNews" icon="el-icon-refresh"></el-button>
    </div>
    <div style="height: calc(100vh - 80px);overflow: auto;padding: 16px;">
      <item v-if="!item.has_read" :item="item" :key="itemIndex" v-for="(item, itemIndex) of newsList" @markRead="markRead(item)" @subscribeChanged="subscribeChanged(item)" />
    </div>
  </el-drawer>
</template>

<script>
import item from './item.vue'

export default {
  components: {
    item
  },
  data() {
    return {
      interval: null,
      visible: false,
      newsList: []
    }
  },
  watch: {
    visible(val) {
      if (!val) {
        this.startInterval()
      }
    }
  },
  beforeDestroy() {
    this.$bus.$off('openNewsPanel')
    this.stopInterval()
  },
  mounted() {
    this.$bus.$on('openNewsPanel', _ => {
      this.stopInterval()
      this.visible = true
    })
    this.startInterval()
    this.initNews()
  },
  methods: {
    startInterval() {
      this.stopInterval()
      this.interval = setInterval(_ => {
        this.loadNews()
      }, 5 * 60 * 1000)
    },
    stopInterval() {
      if (this.interval) {
        clearInterval(this.interval)
        this.interval = null
      }
    },
    initNews() {
      if (this.newsList.length === 0) {
        this.loadNews()
      }
    },
    markRead(item) {
      this.$http.put(`/api/news/mark/read?id=${ item._id }`).then(_ => {
        item.has_read = true
        this.updateNewsCount()
      }).catch(_ => {
        console.error(_)
      })
    },
    subscribeChanged(item) {
      this.$http.put(`/api/news/mark/subscribe?id=${ item._id }&subscribe=${ Number(!item.subscribe) }`).then(_ => {
        item.subscribe = !item.subscribe
      }).catch(_ => {
        console.error(_)
      })
    },
    loadNews() {
      this.$http.get(`/api/news/page`).then(page => {
        this.newsList = page['list']
        this.updateNewsCount()
      }).catch(_ => {
        this.$message.error('加载新闻失败')
      })
    },
    updateNewsCount() {
      const unReadCount = this.newsList.filter(item => !item.has_read && !item.subscribe).length
      this.$bus.$emit('update_news_count', unReadCount)
    }
  }
}
</script>
