<!-- -->
<template>
  <div v-show="visibleState" class="lr-fast-reader">
    <div style="position: relative">
      <el-card v-if="!collapse">
        <div style="display: flex">
          <div class="lr-fast-reader__badge" v-if="newItemCount > 0">
            <span style="color: #888">未读</span>&nbsp;<el-badge :max="99" :value="newItemCount"/>
          </div>
          <div class="lr-fast-reader__time" v-if="current">
            {{ current.created }}
          </div>
          <div style="flex: 1">
            <template v-if="current">
              <template v-if="current.type === 'live'">
                <live-item :item="current.data" ref="item" />
              </template>
              <template v-else-if="current.type === 'news'">
                <news-item :item="current.data" :showMarkRead="false" ref="item" @itemRead="reloadNews" />
              </template>
            </template>
          </div>
        </div>
      </el-card>
      <div v-if="!collapse" @click.stop="collapse = true" style="bottom: -12px;" class="lr-fast-reader__collapse">
        <el-button circle icon="el-icon-d-arrow-right" ></el-button>
      </div>
    </div>
    <div v-if="collapse" @click.stop="collapse = false" style="bottom: 0" class="lr-fast-reader__collapse">
      <el-button round icon="el-icon-d-arrow-left" ><el-badge :max="99" :value="collapseItemCount"></el-badge></el-button>
    </div>
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
        visibleState: false,
        loading: false,
        current: null,
        history: [],
        itemList: [],
        collapse: false,
      }
    },
    computed: {
      containerOffset() {
        if (!this.collapse) {
          return {
            bottom: '16px'
          }
        } else {
          return {
            top: '100%',
            'margin-top': '32px'
          }
        }
      },
      collapseItemCount() { // 收缩时显示的新消息数量
        if (this.current) {
          return this.newItemCount + 1
        } else {
          return this.newItemCount
        }
      },
      newItemCount() {
        return this.itemList.length
      },
      hasNext() {
        return this.itemList.length > 0
      }
    },
    watch: {
      current(val) {
        this.visibleState = !!val
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
        this.showView()
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
        this.showView()
      })
    },
    methods: {
      addItem(model) {
        model.created = this.$moment().format('HH:mm')
        if (this.current && this.current.id === model.id) {
          return
        }
        if(this.itemList.find(item => item.id === model.id)) {
          return
        }
        this.itemList.push(model)
      },
      markReadCurrentItem() {
        const current = this.current
        if (!current) {
          return Promise.resolve()
        } else {
          return this.$refs.item.markRead()
        }
      },
      showView() {
        if (!this.current) {
          this.toNext()
        }
      },
      toNext() {
        if (this.loading) {
          return this.$message.warning('有任务正在进行中')
        }
        this.loading = true
        this.markReadCurrentItem().then(_ => {
          this.current = this.itemList.shift()
          this.loading = false
        }).catch(_ => {
          console.error(_)
          this.loading = false
        })
      },
      reloadNews() { // 刷新新闻
        this.$bus.$emit('reloadNews')
      }
    }
  }
</script>

<style lang="scss">
.lr-fast-reader{
  width: 80vw;
  position: fixed;
  left: 10vw;
  z-index: 9999999;
  min-height: 48px;
  bottom: 20px;
  .el-card__body{
    padding: 16px 20px;
  }
}

.lr-fast-reader__badge{
  width: 84px;
  font-size: 14px;
  padding-top: 2px;
}

.lr-fast-reader__time{
  width: 48px;
  font-size: 14px;
  margin-top: 3px;
}

.lr-fast-reader__collapse{
  position: absolute;
  text-align: center;
  width: 100%;
  i{
    transform: rotate(90deg);
  }
}
</style>
