<template>
  <div>
    <div style="display: flex">
      <div style="flex: 1;display: flex;margin-right: 16px">
        <div>
          <el-form :inline="true">
            <el-form-item :label="`前交易日${ yesterdayDateLabel }`">
              <el-date-picker :clearable="false" @change="yesterdayChanged" v-model="yesterdayDate" style="width: 140px"></el-date-picker>
            </el-form-item>
            <el-form-item label="">
              <risk-detector />
              <stock-concept style="margin-left: 8px"/>
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
    <div style="display: grid;grid-template-columns: 1fr 1fr 1fr;grid-row-gap: 8px; grid-column-gap: 16px;">
      <stock-tracker :yesterday="yesterdayDate" :code="item.code" :name="item.name" :item="item" v-for="(item, itemIndex) of stockPool" :key="item.code"></stock-tracker>
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
import stockConcept from './stockConcept.vue'

export default {
  components: {
    stockTracker,
    allStockNotice,
    riskDetector,
    moneyTracker,
    emotionTracker,
    stockConcept
  },
  data() {
    return {
      yesterdayDate: this.getYesterdayDate(),
      stockCode: '',
      showNotice: false
    }
  },
  computed: {
    yesterdayDateLabel() {
      if (this.yesterdayDate) {
        const day = this.$moment(this.yesterdayDate).toDate().getDay()
        return `.周${ ['日', '一', '二', '三', '四', '五', '六'][day] }`
      }
      return ''
    },
    stockPool() {
      return this.$store.getters.stockPoolList
    }
  },
  methods: {
    yesterdayChanged(val) {
      const today = this.$moment().format('YYYY-MM-DD')
      const current = this.$moment(val).format('YYYY-MM-DD')
      this.$local.set('yesterday_date', current, this.$moment(`${ today } 23:59:59`).toDate())
    },
    getYesterdayDate() { // 计算上一个交易日的日期
      const historyValue = this.$local.get('yesterday_date')
      if (historyValue) {
        return this.$moment(historyValue).toDate()
      }
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
    }
  }
}
</script>
