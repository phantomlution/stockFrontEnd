<template>
  <el-drawer direction="ltr" size="50%" :visible.sync="visible">
    <div slot="title">
      <span>新闻面板</span>
      <el-button type="text" @click.stop="loadUnReadNews" icon="el-icon-refresh"></el-button>
    </div>
    <div style="text-align: center;margin-bottom: 8px">
      <el-radio-group v-model="currentTab">
        <el-radio-button label="unread">未读</el-radio-button>
        <el-radio-button label="read">已读</el-radio-button>
      </el-radio-group>
    </div>
    <div style="height: calc(100vh - 120px);overflow: auto;padding: 16px;" v-loading="loading">
      <div v-if="currentTab === 'unread'">
        <item :item="item" :key="itemIndex" v-for="(item, itemIndex) of unreadNewsList" @itemRead="itemRead(item)" />
      </div>
      <div v-else>
        <item :item="item" :key="itemIndex" v-for="(item, itemIndex) of readNewsList" @itemRead="itemRead(item)" />
      </div>
    </div>
  </el-drawer>
</template>

<script>
import item from './item.vue'
import scheduleMixin from '@/mixins/schedule'

export default {
  mixins: [scheduleMixin],
  components: {
    item
  },
  data() {
    return {
      visible: false,
      loading: false,
      currentTab: 'unread',
      readNewsList: [],
      unreadNewsList: []
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.stopTracker()
      } else {
        this.startTracker()
      }
    },
    currentTab(val) {
      if (val === 'read') {
        this.loadReadNews()
      }
    }
  },
  beforeDestroy() {
    this.$bus.$off('openNewsPanel')
  },
  mounted() {
    this.$bus.$on('openNewsPanel', _ => {
      this.visible = true
    })
    this.startTracker()
  },
  methods: {
    stopTracker() {
      this.stopSchedule()
    },
    startTracker() {
      this.startSchedule(this.loadUnReadNews, 60)
    },
    itemRead(item) {
      const itemIndex = this.unreadNewsList.findIndex(news => news._id === item._id)
      this.unreadNewsList.splice(itemIndex, 1)
      this.updateUnReadNewsCount()
    },
    normalization(newsList) {
      newsList.forEach(item => {
        const title = item.title.toLowerCase()
        if (title.indexOf('chinese') !== -1 || title.indexOf('china') !== -1) {
          item.important = true
        }
      })
    },
    loadReadNews() {
      this.loading = true
      setTimeout(_ => {
        this.$http.get(`/api/news/page/read`).then(page => {
          const newsList = page['list']
          this.normalization(newsList)
          this.readNewsList = newsList
          this.loading = false
        }).catch(_ => {
          this.loading = false
        })
      }, 300)
    },
    loadUnReadNews() {
      this.loading = true
      this.$http.get(`/api/news/page/unread`).then(page => {
        const newsList = page['list']
        this.normalization(newsList)
        this.unreadNewsList = newsList
        this.updateUnReadNewsCount()
        this.loading = false
        // 更新快速阅读视图
        this.$bus.$emit('fast_reader_add_news', newsList)
      }).catch(_ => {
        this.loading = false
      })
    },
    updateUnReadNewsCount() {
      const unReadCount = this.unreadNewsList.length
      this.$bus.$emit('update_news_count', unReadCount)
    }
  }
}
</script>
