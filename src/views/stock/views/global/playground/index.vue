<template>
  <div tabindex="0" @keydown.down.prevent="toNext" @keydown.up.prevent="toPrevious" style="height: 300px;background-color: grey">
    新消息{{ itemList.length }}
    <template v-if="current">
      {{ current }}
      <template v-if="current.type === 'live'">
        <live-item :item="current.data" ref="item" />
      </template>
      <template v-else-if="current.type === 'news'">
        <news-item :item="current.data" :showMarkRead="false" ref="item" />
      </template>
    </template>
  </div>
</template>

<script>
import liveItem from '@/views/stock/views/global/live/item.vue'
import newsItem from '@/views/stock/views/global/news/item.vue'

export default {
  components: {
    liveItem,
    newsItem
  },
  data() {
    return {
      current: null,
      history: [],
      itemList: []
    }
  },
  mounted() {
    this.$bus.$on('fast_reader_add_live', item => {
      const model = {
        type: 'live',
        id: `live_${item.id}`,
        data: item
      }
      this.addItem(model)
    })

    this.$bus.$on('fast_reader_add_news', itemList => {
      itemList.forEach(item => {
        const model = {
          type: 'news',
          id: `news_${item._id}`,
          data: item
        }
        this.addItem(model)
      })
    })
  },
  computed: {
    hasPrevious() {
      return this.history.length > 0
    },
    hasNext() {
      return this.itemList.length > 0
    }
  },

  methods: {
    addItem(model) {
      this.itemList.push(model)
    },
    toPrevious() {
      if (this.hasPrevious) {
//        this.current
      }
    },
    markReadCurrentItem() {
      const current = this.current
      if (!current) {
        return Promise.resolve()
      } else {
        return this.$refs.item.markRead()
      }
    },
    toNext() {
      this.markReadCurrentItem().then(_ => {
//        this.history.push(this.current)
        this.current = this.itemList.shift()
      })
    },
  }
}
</script>
