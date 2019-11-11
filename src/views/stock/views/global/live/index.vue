<template>
  <el-popover v-model="visible">
    <div style="width: 640px;height: 480px;overflow: auto;padding: 8px;">
      <div>
        <div class="el-timeline-item__timestamp" style="margin-bottom: 8px; font-size: 16px">
          {{ todayDateString }}
        </div>
        <el-timeline style="padding-left: 0">
          <el-timeline-item :timestamp="item.dateStr" placement="top" v-for="item of itemList" :key="item.id">
            <div :class="{ 'lr-live-item--important': item.isImportant }">
              <template v-if="item.macro">
                <el-card>
                  <h3>{{ item.title }}</h3>
                  <p>
                    <span>前值: {{ item.former }}</span>
                    <el-divider direction="vertical"></el-divider>
                    <span>预测值: {{ item.predict }}</span>
                    <el-divider direction="vertical"></el-divider>
                    <span>实际值: {{ item.current }}</span>
                  </p>
                </el-card>
              </template>
              <template v-else>
                <div style="display: flex">
                  <div style="flex: 1">{{ item.title }}</div>
                  <div v-if="item.imageList" style="margin-left: 32px;">
                    <el-image style="max-width: 96px;max-height: 72px" :data-src="url" :src="url" :preview-src-list="[url]" v-for="url of item.imageList" :key="url"></el-image>
                  </div>
                </div>

              </template>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
    </div>
    <el-badge slot="reference" class="lr-live-button" :value="newMessageCount" :hidden="newMessageCount === 0" :max="99">
      <el-button size="small" :style="stateColor" circle icon="el-icon-s-platform"></el-button>
    </el-badge>
  </el-popover>
</template>

<script>
import { idGenerator } from '@/utils'

export default {
  data() {
    return {
      visible: false,
      newMessageCount: 0,
      todayDateString: '',
      socket: null,
      socketState: 0, // 0(ing), 1(succuss), 2(disconnect),
      itemList: [],
      newsIdCache: []
    }
  },
  computed: {
    stateColor() {
      if (this.socketState === 0) {
        return {
          color: '#e6a23c'
        }
      } else if (this.socketState === 1) {
        return {
          color: '#67c23a'
        }
      } else {
        return {
          color: '#f56c6c'
        }
      }
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.newMessageCount = 0
      }
    }
  },
  mounted() {
    this.loadInitData()
    this.initEventSource()
  },
  beforeDestroy() {
    if (this.socket) {
      this.socket.close()
    }
  },
  methods: {
    loadInitData() {
      const dateList = [this.$moment().format('YYYY-MM-DD')]
      this.loadHistory(dateList)
    },
    loadHistory(dateList) { // 注意时序，旧到新
      Promise.all(dateList.map(date => this.loadData(date))).then(responseList => {
        responseList.forEach(itemList => {
          itemList.reverse()
          itemList.forEach(item => {
            this.addNewestToList(item)
          })
        })
      })
    },
    loadData(date) {
      return this.$http.get(`/api/live/fx?date=${date}`)
    },
    addNewestToList(model) { // 将最新的数据插入列表
      model.id = idGenerator.next('live')

      let dateFormat = 'HH:mm'

      if (this.itemList.length > 0) {
        const lastItem = this.itemList[0]
        if (!this.$moment(model.timestamp).isSame(this.$moment(lastItem.timestamp), 'day')){
          lastItem.dateStr = this.$moment(lastItem.timestamp).format(`YYYY-MM-DD ${ dateFormat }`)
        }
      }
      model['dateStr'] = this.$moment(model.timestamp).format(dateFormat)
      this.todayDateString = this.$moment().format('YYYY-MM-DD')

      if (model.imageList) { // 调整清晰度
        model.imageList = model.imageList.map(item => {
          return item.replace('/sl_', '/sy_')
        })
      }
      // 展示
      this.itemList.unshift(model)
    },
    updateMessageCount() {
      if (!this.visible) {
        this.newMessageCount += 1
      }
    },
    resolveMessage(message) {
      // 转换模型
      const model = {
        "title": message['newsTitle'],
        "former": message['previousValue'],
        "predict": message['forecaseValue'],
        "current": message['currentValue'],
        "isImportant": message['importantLevel'] === 3,
        "timestamp": message['publishtime'] * 1000,
        "newsId": message['newsId'],
        "isTop": message['isTop'] || false
      }
      console.warn(message)

      // 新闻去重
      if (this.newsIdCache.indexOf(model.newsId) === -1) {
        this.newsIdCache.push(model.newsId)
      } else {
        console.error('重复数据')
        return
      }

      this.updateMessageCount()
      this.addNewestToList(model)
    },
    initEventSource() { // 连接数据源
      const url = 'https://js.fx678.com:8800'
      const socket = window.io(url, {
        'reconnection': true,
        'reconnectionDelay': 200,
        'reconnectionDelayMax' : 1000,
        'force new connection' : true
      });

      socket.on('connect', _ => {
        this.socketState = 1
      })

      socket.on('news', data => {
        this.resolveMessage(data)
      })

      socket.on('disconnect', _ => {
        this.socketState = 2
      })
      this.socket = socket
    }
  }
}
</script>

<style lang="scss">
.lr-live-item--important{
  color: red;
}

.lr-live-button{
  position: fixed;
  left: 50%;
  top: 16px;
  z-index: 999;
  transform: translateX(-50%);

}
</style>
