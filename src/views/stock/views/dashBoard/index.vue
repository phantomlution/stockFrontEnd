<template>
  <div>
    <div style="display: flex">
      <div style="flex: 1;display: flex;margin-right: 16px">
        <div>
          <el-form :inline="true">
            <el-form-item :label="`前交易日${ yesterdayDateLabel }`">
              <el-date-picker :clearable="false" v-model="yesterdayDate" style="width: 140px"></el-date-picker>
            </el-form-item>
            <el-form-item label="风险项">
              <risk-detector ref="riskDetector" />
            </el-form-item>
          </el-form>
        </div>
        <div style="flex: 1;text-align: right">
          <emotion-tracker />
        </div>
      </div>
      <div>
        <money-tracker />
      </div>
    </div>
    <div style="margin-top: 16px;display: grid;grid-template-columns: 1fr 1fr 1fr;grid-row-gap: 8px; grid-column-gap: 16px;">
      <stock-tracker @removeItem="removeItem(itemIndex)" :yesterday="yesterdayDate" :code="item.code" :name="item.name" :item="item" v-for="(item, itemIndex) of stockPool" :key="item.code"></stock-tracker>
    </div>
    <div style="margin-top: 16px;margin-bottom: 8px;">
      <template v-if="!showNotice">
        <el-button type="primary" size="large" style="width: 100%" @click.stop="showNotice=true">展开公告</el-button>
      </template>
      <template v-else>
        <all-stock-notice :stock-list="stockPool" />
      </template>
    </div>
  </div>
</template>

<script>
import stockTracker from './stockTracker.vue'
import allStockNotice from './allStockNotice.vue'
import riskDetector from './riskDetector.vue'
import moneyTracker from './moneyTracker.vue'
import emotionTracker from './emotionTracker.vue'

export default {
  components: {
    stockTracker,
    allStockNotice,
    riskDetector,
    moneyTracker,
    emotionTracker
  },
  data() {
    return {
      yesterdayDate: this.getYesterdayDate(),
      stockCode: '',
      stockPool: [],
      showNotice: false
    }
  },
  computed: {
    riskDetector() {
      return this.$refs.riskDetector
    },
    yesterdayDateLabel() {
      if (this.yesterdayDate) {
        const day = this.$moment(this.yesterdayDate).toDate().getDay()
        return `.周${ ['日', '一', '二', '三', '四', '五', '六'][day] }`
      }
      return ''
    }
  },
  mounted() {
    this.loadStockPool()
  },
  methods: {
    getYesterdayDate() { // 计算上一个交易日的日期
      //TODO 手动操作可以做一次浏览器缓存
      const day = new Date().getDay()
      let diff = -1
      if (day === 6) { // 周六
        diff = -2
      }else if (day === 0) { // 周日
        diff = -3
      }else if (day === 1) { // 周一
        diff = -3
      }
      return this.$moment().add('days', diff).toDate()
    },
    refresh() {
      this.loadStockPool()
    },
    loadStockPool() {
      this.$http.get(`/api/stock/pool`).then(_ => {
        // 执行强检测任务
        Promise.all(_.map(item => this.detectRisk(item))).then(stockPoolList => {
          this.stockPool = stockPoolList
          // 收集相关信息
          this.riskDetector.collect(stockPoolList)
        }).catch(_ => {
          console.error(_)
        })
      }).catch(_ => {
        console.log(_)
      })
    },
    detectRisk(stockPoolItem) { // 风险检测
      return new Promise((resolve, reject) => {
        this.riskDetector.detect(stockPoolItem.code).then(riskList => {
          stockPoolItem.riskList = riskList
          resolve(stockPoolItem)
        }).catch(_ => {
          reject(_)
        })
      })
    },
    removeItem(tagIndex) {
      const item = this.stockPool[tagIndex]
      const code = item['code']

      this.$http.delete('/api/stock/pool', { code }).then(_ => {
        this.refresh()
      }).catch(_ => {
        console.log(_)
      })
    }
  }
}
</script>
