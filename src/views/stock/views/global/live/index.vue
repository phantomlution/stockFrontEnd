<template>
  <el-popover v-model="visible">
    <div class="lr-live-item__wrapper">
      <div>
        <!-- 置顶信息 -->
        <div v-if="topItemList.length > 0" style="margin-bottom: 8px;">
          <lr-motto v-for="(topItem, topItemIndex) of topItemList" :key="topItemIndex">
            <span style="line-height: 18px" v-html="topItem.title"></span>
          </lr-motto>
        </div>
        <div class="el-timeline-item__timestamp" style="margin-bottom: 8px; font-size: 16px">
          {{ todayDateString }}
        </div>
        <el-timeline style="padding-left: 0">
          <el-timeline-item :timestamp="item.dateStr" placement="top" v-for="item of itemList" :key="item.id">
            <div :class="{ 'lr-live-item--important': item.isImportant }">
              <template v-if="item.macro">
                <el-card>
                  <h3>
                    <el-link :underline="false" style="margin-right: 8px" @click.stop="openCustomEventDialog(item)"><i class="el-icon-paperclip" /></el-link>
                    <span v-html="item.title"></span>
                  </h3>
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
                  <div style="flex: 1">
                    <el-link :underline="false" style="margin-right: 8px" @click.stop="openCustomEventDialog(item)"><i class="el-icon-paperclip" /></el-link>
                    <span v-html="item.title"></span>
                  </div>
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

const sensitiveWord = [
  '在岸人民币', '现货钯金', 'Nymex钯金', '美元指数', 'Nymex美原油', '澳元兑美元'
]
const contentFilterRegex = new RegExp(`^(${ sensitiveWord.map(word => '(' + word +')').join('|') })`)

export default {
  data() {
    return {
      visible: false,
      newMessageCount: 0,
      todayDateString: '',
      socket: null,
      socketState: 0, // 0(ing), 1(succuss), 2(disconnect),
      topItemList: [],
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
    openCustomEventDialog(item) {
      // TODO 宏观数据html生成
      this.$bus.$emit('openCustomEventDialog', {
        content: item.title,
        time: item.timestamp,
        url: item.url
      })
    },
    beautify(model) { // 重新排版
      const paragraphList = model['title'].replace(/；/g, ';').split(';').filter(item => item)
      model.title = paragraphList.map((item, itemIndex) => {
        if (itemIndex === 0) {
          return `${ item }${ paragraphList.length === 1 ? '' : ';' }`
        } else{
          return `<p>${ item };</p>`
        }
      }).join('')
    },
    addNewestToList(model) { // 将最新的数据插入列表
      if (!model.isImportant) {
        if (contentFilterRegex.test(model.title)) {
          return
        }
      }
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

      if (model.isTop) { // 置顶信息
        this.topItemList.push(model)
      }

      this.beautify(model)

      // 展示
      this.itemList.unshift(model)
    },
    updateMessageCount() {
      if (!this.visible) {
        this.newMessageCount += 1
      }
    },
    resolveMessage(message) {
      if (message.actionType === 3) {
        return
      }
      // 转换模型
      const model = {
        "title": message['newsTitle'],
        "macro": message['idxId'] !== 0,
        "former": message['previousValue'],
        "predict": message['forecaseValue'],
        "current": message['currentValue'],
        "isImportant": message['importantLevel'] === 3,
        "timestamp": message['publishtime'] * 1000,
        "newsId": message['newsId'],
        "isTop": message['isTop'] || false
      }
      if (message['newsimage']) {
        model.imageList = [
          message['newsimage']
        ]
      }
      console.warn(message)

      // 新闻去重
      if (this.newsIdCache.indexOf(model.newsId) === -1) {
        this.newsIdCache.push(model.newsId)
      } else {
        return
      }

      this.updateMessageCount()
      this.addNewestToList(model)
    },
    initEventSource() { // 连接数据源

      return
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
.lr-live-item__wrapper{
  width: 640px;
  height: 480px;
  overflow: auto;
  padding: 8px;
  .el-link{
    position: absolute;
    top: 1px;
    left: 68px;
  }
}

.lr-live-item--important{
  color: red;
  .el-card{
    color: inherit;
  }
}

.lr-live-button{
  position: fixed;
  left: 50%;
  top: 16px;
  z-index: 999;
  transform: translateX(-50%);

}
</style>
