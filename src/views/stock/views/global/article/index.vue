<template>
  <el-drawer direction="ltr" :visible.sync="visible" size="75%">
    <div slot="title">
      <el-link target="_blank" :underline="false" :href="href">{{ title }}</el-link>
    </div>
    <div>
      <div class="lr-article-reader">
        <div>
          <span>{{ userName }}</span>
          <span v-if="userAction">{{ userAction }}</span>
        </div>
        <div v-html="content" :id="articleContainerId"></div>
      </div>
    </div>

  </el-drawer>
</template>

<script>
import { idGenerator } from '@/utils'

export default {
  data() {
    return {
      articleContainerId: idGenerator.next('article'),
      visible: false,
      href: '',
      title: '',
      content: '',
      userName: '',
      userAction: ''
    }
  },
  beforeDestroy() {
    this.$bus.$off('open_article')
  },
  mounted() {
    this.$bus.$on('open_article', item => {
      this.showArticle(item.raw)
    })
  },
  methods: {
    showArticle(item) {
      this.content = item.content
      this.title = item.title
      this.href = item.title_url ? item.title_url : null
      this.userName = item.user_name
      this.userAction = item.action_text
      if (!this.title) {
        this.title = this.userName
      }
      console.log(item)

      this.visible = true
      this.$nextTick(_ => {
        const lazyImageList = document.querySelectorAll(`#${ this.articleContainerId } img`)
        lazyImageList.forEach(lazyImage => {
          if (lazyImage.classList.value.indexOf('lazy') !== -1) {
            lazyImage.src = lazyImage['attributes']['data-actualsrc'].value
          }
        })

      })
    }
  }
}
</script>

<style lang="scss">
.lr-article-reader{
  overflow: auto;
  padding: 16px 20px;
  font-family: -apple-system,BlinkMacSystemFont,Helvetica Neue,PingFang SC,Microsoft YaHei,Source Han Sans SC,Noto Sans CJK SC,WenQuanYi Micro Hei,sans-serif;
  font-size: 15px;
  color: #1a1a1a;
  word-break: break-word;
  line-height: 1.6;
  p {
    margin: 1.4em 0;
  }
  img{
    max-width: 100%;
    height: auto !important;
  }

}
</style>
