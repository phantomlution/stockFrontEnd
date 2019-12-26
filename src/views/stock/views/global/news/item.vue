<template>
  <div class="lr-news-item">
    <div style="margin-bottom: 16px">
      <div style="display: flex">
        <div style="flex: 1">
          <div class="lr-news-item__title" :style="titleStyle" @click.stop="openArticle">
            {{ item.title }}
          </div>
        </div>
        <div>
          <div>
            <el-button type="text" @click.stop="markRead" v-if="!item.has_read">已读</el-button>
          </div>
          <div style="margin-top: 8px;" @click.stop="openCustomEventDialog">
            <el-link type="primary" :underline="false"><i class="el-icon-paperclip" ></i></el-link>
          </div>
        </div>
      </div>
    </div>
    <div style="color: #ABABAB;font-size: 14px;margin-bottom: 16px;" v-if="item.shorterDescription">
      {{ item.shorterDescription }}
    </div>
    <div style="display: flex">
      <div style="flex: 1">
        <el-tag type="primary" >
          {{ item.source }}
        </el-tag>
        <template v-if="item.section">
          <el-tag type="warning" >{{ item.section }}</el-tag>
        </template>
      </div>
      <div>
        <template v-if="item.premium">
          <el-tag type="danger" >付费</el-tag>
        </template>
        <template v-if="item.materialType">
          <el-tag type="primary" >{{ item.materialType }}</el-tag>
        </template>
        <el-tag type="info" >
          {{ item.publish_date }}
        </el-tag>
        <el-rate :value="subscribeValue" :max="1" @click.native.stop="subscribeChanged" style="display: inline-block"></el-rate>
      </div>
    </div>
  </div>
</template>

<script>
const props = {
  item: {
    type: Object,
    required: true
  }
}

export default {
  props,
  data() {
    return {
      subscribeValue: 0
    }
  },
  computed: {
    titleStyle() {
      const style = {}
      if (this.item.important) {
        style['color'] = 'red'
      }
      return style
    }
  },
  watch: {
    'item.subscribe'() {
      this.updateSubscribeValue()
    }
  },
  mounted() {
    this.updateSubscribeValue()
  },
  methods: {
    updateSubscribeValue() {
      let val = this.item.subscribe
      if (val) {
        this.subscribeValue = 1
      } else {
        this.subscribeValue = 0
      }
    },
    subscribeChanged() {
      this.$emit('subscribeChanged')
    },
    markRead() {
      this.$emit('markRead')
    },
    openArticle() {
      const url = this.item.url || ''

      window.open(url, '_blank')
    },
    openCustomEventDialog() {
      let contentHtml = `<p>${ this.item.title }</p>`
      if (this.item.shorterDescription) {
        contentHtml += `<p>${ this.item.shorterDescription }</p>`
      }

      this.$bus.$emit('openCustomEventDialog', {
        content: contentHtml,
        url: this.item.url,
        time: this.item.publish_date
      })
    }
  }
}
</script>

<style lang="scss">
.lr-news-item{
  padding: 8px;
  box-shadow: 0px 2px 13px 0px rgba(0, 0, 0, 0.06);
  border-radius: 4px;
  overflow: hidden;
  transition: all .3s ease;
  & + .lr-news-item{
    margin-top: 16px;
  }
  .lr-news-item__title{
    font-size: 16px;
    font-weight: bold;
    color: #3b3b3b;
    line-height: 1.5;
    &:hover{
      cursor: pointer;
    }
  }
}
</style>
