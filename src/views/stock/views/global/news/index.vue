<template>
  <el-drawer title="新闻面板" direction="ltr" size="50%" :visible.sync="visible">
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
    console.log('mounted')
    this.$bus.$on('openNewsPanel', _ => {
      this.visible = true
      this.loadNews()
    })
    this.$bus.$emit('openNewsPanel')
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
