<template>
  <div class="lr-quote">
    <div class="lr-quote__item">
      <div class="lr-quote__item--label">现货黄金</div>
      <div class="lr-quote__item--price">{{ quote.xau.price }}</div>
      <div class="lr-quote__item--change">
        <lr-number-tag :amount="quote.xau.diff" ></lr-number-tag>
        <!--{{ quote.xau.diff }}-->
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
      socketState: 0,
      quote: {
        xau: { // 现货黄金
          price: null,
          diff: null
        }
      }
    }
  },
  mounted() {
    this.initEventSource()
  },
  methods: {
    initEventSource() { // 连接数据源
      const url = 'https://hqjs.fx678img.com:9180'
      const socket = window.io(url, {
        'reconnection': true,
        'reconnectionDelay': 200,
        'reconnectionDelayMax' : 1000,
        'force new connection' : true
      })

      // const quoteItemList = ['XAU','XAG','EURUSD','USD','CONC','1A0001','NIKKI','FTSE','DAX','NASDAQ','GBPUSD','USDJPY','AUDUSD','USDCAD','USDCNY']

      // 目前只提取美元数据
      const quoteItemList = ['XAU']
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
      console.log(type)

      this.quote[type].price = Number(now).toFixed(2)
      this.quote[type].diff = increment(now, yesterday)
    }
  }
}

</script>

<style lang="scss">
.lr-quote{
  border: 1px solid #e9e9e9;
  display: inline-block;
  background: #FFFFFF;
  border-radius: 15px;
}

.lr-quote__item{
  display: flex;
  padding: 7px 16px;
  font-size: 11px;
}

.lr-quote__item--label{
  width: 60px;
  font-weight: 400;
}
.lr-quote__item--price{
  width: 54px;
  font-weight: 400;
}

.lr-quote__item--change{
  /*width: 44px;*/
}
</style>
