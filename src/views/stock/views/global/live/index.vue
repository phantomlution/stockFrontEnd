<template>
  <el-popover>
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
                <div>{{ item.title }}</div>
              </template>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
    </div>
    <el-button size="small" class="lr-live-button" :style="stateColor" slot="reference" circle icon="el-icon-s-platform"></el-button>
  </el-popover>
</template>

<script>
import { idGenerator } from '@/utils'

export default {
  data() {
    return {
      todayDateString: '',
      socket: null,
      socketState: 0, // 0(ing), 1(succuss), 2(disconnect),
      itemList: []
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
      // 展示
      this.itemList.unshift(model)
    },
    handleMessage(message) {
      // 转换模型
      const model = {
        "title": message['newsTitle'],
        "isImportant": message['importantLevel'] === 3,
        "timestamp": message['publishtime'] * 1000
      }

      this.addNewestToList(model)
    },
    newMessage() {
      const item = {
        AppFirstPage: 0,
        NewsSummary: "",
        actionType: 1,
        bsid: 1,
        columnId: 1,
        columnType: 1,
        country: "",
        currentValue: "-",
        forecaseValue: "-",
        groupword: "",
        idxId: 0,
        importantLevel: 3,
        isShortNews: 1,
        isTop: 0,
        keyword: "100000,100930",
        mobilePush: 1,
        newsAnalysis: "",
        newsId: "201911091914162110",
        newsTitle: "彭博社创始人布隆伯格注册为美国民主党总统竞选人；\n美国纽约市前市长迈克尔·布隆伯格8日在亚拉巴马州递交材料，注册为2020年总统选举亚拉巴马州民主党初选候选人。布隆伯格现年77岁，是彭博社创始人和首席执行官，身家大约534亿美元，2002年至2013年三度出任美国最大城市纽约市市长。他曾是共和党人，后转为独立人士，去年注册为民主党人。（新华社）",
        newsType: "10216",
        newsType2: "10216,10196,10002",
        newsimage: "",
        previousValue: "-",
        publishtime: 1573298036,
        status: 1
      }
      this.handleMessage(item)

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

      socket.on('news', function(data){
        this.handleMessage(data)
        this.$notify({
          title: '收到新消息',
          duration: 0
        })
        console.warn(data)
      })

      socket.on('disconnect', function(){
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
  transform: translateX(-50%);

}
</style>
