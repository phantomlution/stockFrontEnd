<template>
  <div>
    <el-radio-group v-model="currentTab" style="width: 100%;text-align: center;margin-bottom: 16px">
      <el-radio-button label="vix">恐慌指数</el-radio-button>
      <el-radio-button label="singleStockNotice">个股公告</el-radio-button>
      <el-radio-button label="noticeSearch">公告检索</el-radio-button>
      <el-radio-button label="marketTheme">主题筛选器</el-radio-button>
      <el-radio-button label="economicData">经济数据</el-radio-button>
      <el-radio-button label="goldTrend">黄金价格走势</el-radio-button>
      <el-radio-button label="stockMarketHeat" >大盘热度分析</el-radio-button>
      <el-radio-button label="openAccountIndex">股票开户指数</el-radio-button>
      <el-radio-button label="farmProductIndex">农场品指数</el-radio-button>
    </el-radio-group>
    <div>
      <div v-if="currentTab === 'vix'">
        <lr-link-page src="https://quote.fx678.com/symbol/VIXDX" />
      </div>
      <div v-show="currentTab === 'singleStockNotice'">
        <single-stock-notice />
      </div>
      <div v-show="currentTab === 'noticeSearch'">
        <market-notice />
      </div>
      <div v-if="currentTab === 'marketTheme'">
        <market-theme />
      </div>
      <div v-if="currentTab === 'economicData'">
        <lr-link-page src="http://data.eastmoney.com/center/macro.html"/>
      </div>
      <div v-if="currentTab === 'goldTrend'">
        <lr-link-page src="http://quote.eastmoney.com/center/hjsc.html" />
      </div>
      <div v-show="currentTab === 'stockMarketHeat'">
        <stock-market-heat />
      </div>
      <div v-if="currentTab === 'openAccountIndex'">
        <lr-link-page title="2019.03.19指数(17699)" src="http://index.baidu.com/v2/main/index.html#/trend/股票开户?words=股票开户" />
      </div>
      <div v-if="currentTab === 'farmProductIndex'">
        <farm-product-index />
      </div>
    </div>
  </div>
</template>

<script>
import singleStockNotice from './singleStockNotice.vue'
import marketNotice from './marketNotice.vue'
import farmProductIndex from './farmProductIndex.vue'
import stockMarketHeat from './stockMarketHeat.vue'
import marketTheme from './marketTheme.vue'

export default {
  components: {
    singleStockNotice,
    marketNotice,
    farmProductIndex,
    stockMarketHeat,
    marketTheme
  },
  data() {
    return {
      currentTab: 'singleStockNotice'
    }
  }
}
</script>
