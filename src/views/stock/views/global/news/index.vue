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
      visible: false,
      newsList: []
    }
  },
  beforeDestroy() {
    this.$bus.$off('openNewsPanel')
  },
  mounted() {
    this.$bus.$on('openNewsPanel', _ => {
      this.visible = true
      setTimeout(_ => {
        this.loadNews()
      }, 200)
    })
  },
  methods: {
    markRead(item) {
      this.$http.put(`/api/news/mark/read?id=${ item._id }`).then(_ => {
        item.has_read = true
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
      })
    }
  }
}
</script>
