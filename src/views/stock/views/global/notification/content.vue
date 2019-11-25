<template>
  <div :style="containerStyle">
    <div>
      <div class="el-notification__title" style="margin-top: -4px;margin-bottom: 8px">
        {{ item.title }}
      </div>
    </div>
    <div>
      <template v-if="item.html">
        <div v-html="item.description"></div>
      </template>
      <template v-else>
        {{ item.description }}
      </template>
    </div>
    <div style="margin-top: 8px;margin-bottom: -8px;">
        <div style="display: flex;justify-content: center;align-items: center">
          <span style="flex: 1;color: #909399">
            <span v-if="item.release_date">
              数据发布于: {{ item.release_date }}
            </span>
          </span>
          <template v-if="!hasRead">
            <el-button type="text" @click.stop="markRead">{{ buttonLabel }}</el-button>
          </template>
          <template v-else>
            <span style="color: #909399">已读</span>
          </template>
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
      hasRead: this.item.has_read || false,
    }
  },
  computed: {
    isReaderItem() {
      return this.item.type === 'reader'
    },
    buttonLabel() {
      if (this.isReaderItem) {
        return '立即查看'
      }
      return '标记为已读'
    },
    containerStyle() {
      if (this.item.html) {
        if (this.item.description.indexOf('</table>') !== -1) {
          return {
            width: '540px'
          }
        }
      }

      return {
        "width": "330px"
      }
    }
  },
  methods: {
    markRead() {
      const item = this.item
      this.$http.put(`/api/notification/read?id=${ item._id}`).then(_ => {
        this.hasRead = true
        if (this.isReaderItem) {
          this.$bus.$emit('open_article', this.item)
        }

        // 关闭通知
        setTimeout(_ => {
          this.$bus.$emit('close_notification', item.notificationId)
        }, 300)
      }).catch(_ => {
        console.error(_)
      })
    },
  }
}
</script>
