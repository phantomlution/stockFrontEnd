<template>
  <div style="display: inline-block">
    <div class="lr-quote" v-show="visible">
      <div class="lr-quote__item">
        <div class="lr-quote__item--label">现货黄金</div>
        <div class="lr-quote__item--price">{{ quote.xau.price }}</div>
        <div class="lr-quote__item--change">
          <lr-number-tag :amount="quote.xau.diff" ></lr-number-tag>
        </div>
      </div>
      <el-divider direction="vertical"></el-divider>
      <div class="lr-quote__item">
        <div class="lr-quote__item--label">离岸人民币</div>
        <div class="lr-quote__item--price">{{ quote.usdcnh.price }}</div>
        <div class="lr-quote__item--change">
          <lr-number-tag :amount="quote.usdcnh.diff" ></lr-number-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import lodash from 'lodash'
import { increment } from '@/utils'

export default {
  data() {
    return {
      socket: null,
      socketState: 0,
      quote: {
        xau: { // 现货黄金
          price: null,
          diff: 0
        },
        usdcnh: { // 美元兑离岸人民币
          price: null,
          diff: 0
        }
      }
    }
  },
  computed: {
    visible() {
      return this.quote.xau.price
    }
  },
  mounted() {
    // 汇通网推送的数据: ['XAU','XAG','EURUSD','USD','CONC','1A0001','NIKKI','FTSE','DAX','NASDAQ','GBPUSD','USDJPY','AUDUSD','USDCAD','USDCNY']

    // 目前只提取美元数据
    const quoteItemList = ['XAU', 'USDCNH']

    this.doInit(quoteItemList).then(_ => {
      this.initEventSource(quoteItemList)
    }).catch(_ => {
      this.initEventSource(quoteItemList)
      console.error(_)
    })
  },
  beforeDestroy() {
    if (this.socket) {
      this.socket.close()
    }
  },
  methods: {
    doInit(quoteItemList) {
      return Promise.all(quoteItemList.map(item => this.loadHistoryQuote(item)))
    },
    loadHistoryQuote(code) {
      const localCodeKey = code.toLowerCase()
      return this.$http.get(`/api/data/quote`, {
        code
      }).then(_ => {
        this.quote[localCodeKey].price = lodash.round(_.current, 2)
        this.quote[localCodeKey].diff = increment(_.current, _.pre_close)
      })
      // 加载历史报价数据
    },
    initEventSource(quoteItemList) { // 连接数据源
      const url = 'https://hqjs.fx678img.com:9180'
      const socket = window.io(url, {
        'reconnection': true,
        'reconnectionDelay': 200,
        'reconnectionDelayMax' : 1000,
        'force new connection' : true
      })


      socket.on('connect', _ => {
        socket.emit('code', quoteItemList)
        this.socketState = 1
      })

      socket.on('sdata', data => {
        this.resolveMessage(data)
      })

      socket.on('disconnect', _ => {
        this.socketState = 2
      })
      this.socket = socket
    },
    resolveMessage(data) {
      const type = data.i.toLowerCase()
      const yesterday = Number(data.x)
      const now = Number(data.c)

      this.quote[type].price = Number(now).toFixed(2)
      this.quote[type].diff = increment(now, yesterday)
    }
  }
}

</script>

<style lang="scss">
.lr-quote{
  border: 1px solid #DCDFE6;
  display: flex;
  background: #FFFFFF;
  border-radius: 15px;
  padding: 7px 8px;
  font-size: 11px;
  &:hover{
    color: #409EFF;
    border-color: #c6e2ff;
    background-color: #ecf5ff;
    cursor: pointer;
  }
  .el-divider--vertical{
    height: 1.5em;
  }
}

.lr-quote__item{
  display: flex;
  padding: 0 4px;
  & + .lr-quote__item{
  }
}

.lr-quote__item--label{
  font-weight: 400;
}
.lr-quote__item--price{
  margin-left: 12px;
  margin-right: 6px;
  font-weight: 400;
}

.lr-quote__item--change{
  /*width: 44px;*/
}
</style>
