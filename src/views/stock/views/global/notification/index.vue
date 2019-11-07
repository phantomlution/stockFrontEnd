<template>
  <div></div>
</template>

<script>
import notificationContent from './content.vue'
import { idGenerator } from '@/utils'

export default {
  data() {
    return {
      notificationMap: new Map(),
      notificationLocalCache: new Map()
    }
  },
  mounted() {
    this.$bus.$on('close_notification', _id => {
      const notification = this.notificationMap.get(_id)
      if (notification) {
        notification.close()
      }
      this.notificationMap.delete(_id)
    })

    // 刷新通知
    this.loadNotification()
    setInterval(_ => {
      this.loadNotification()
    }, 60 * 1000)
  },
  methods: {
    loadNotification() {
      this.$http.get(`/api/notification/list`).then(list => {
        list.forEach(item => {
          if (!this.notificationLocalCache.has(item._id)) {
            this.notificationLocalCache.set(item._id, '')
            this.notify(item)
          }
        })
      }).catch(_ => {
        console.error(_)
      })
    },
    notify(item) {
      const notificationId = idGenerator.next('notification')
      item.notificationId = notificationId
      setTimeout(_ => {
        const notification = this.$notify({
          duration: 0,
          customClass: 'lr-notification-dynamic',
          message: this.$createElement(notificationContent, {
            props: {
              item: item
            }
          }),
          onClose: _ => {
            this.notificationMap.delete(notificationId)
          }
        })
        this.notificationMap.set(notificationId, notification)
      }, 0)
    },
    test() {
      this.loadNotification()
    }
  }
}
</script>

<style lang="scss">
.lr-notification-dynamic{
  width: auto !important;
}
</style>
