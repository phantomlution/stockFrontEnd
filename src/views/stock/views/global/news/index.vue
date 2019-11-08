<template>
  <el-drawer direction="ltr" size="50%" :visible.sync="visible">
    <div slot="title">
      <span>新闻面板</span>
      <el-button type="text" @click.stop="loadNews">刷新</el-button>
    </div>
    <div style="height: calc(100vh - 80px);overflow: auto;padding: 16px;">
      <item :item="item" :key="itemIndex" v-for="(item, itemIndex) of newsList" />
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
    loadNews() {
      this.$http.get(`/api/news/page`).then(page => {
        this.newsList = page['list']
      })
    }
  }
}
</script>
