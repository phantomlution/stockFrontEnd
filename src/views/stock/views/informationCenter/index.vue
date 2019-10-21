<template>
  <div>
    <el-radio-group v-model="currentTab" style="width: 100%;text-align: center;margin-bottom: 16px">
      <el-radio-button label="美债收益率">美债收益率</el-radio-button>
      <el-radio-button label="vix">恐慌指数</el-radio-button>
      <el-radio-button label="goldTrend">黄金现货走势</el-radio-button>
      <el-radio-button label="shiborHistory">shibor历史数据</el-radio-button>
      <el-radio-button label="singleStockNotice">个股公告</el-radio-button>
      <el-radio-button label="marketTheme">主题筛选器</el-radio-button>
      <el-radio-button label="economicData">经济数据</el-radio-button>
      <el-radio-button label="openAccountIndex">股票开户指数</el-radio-button>
      <el-radio-button label="farmProductIndex">农场品指数</el-radio-button>
      <el-radio-button label="estateMarketHeat">房地产热度</el-radio-button>
    </el-radio-group>
    <div>
      <div v-if="currentTab === '美债收益率'">
        <div style="font-size: 16px;color: rgba(0, 0, 0, 0.65);margin-bottom: 8px">
          倒挂算法：3M>10Y
        </div>
        <lr-link-page :redirect="true" src="https://cn.investing.com/rates-bonds/usa-government-bonds?maturity_from=40&maturity_to=290" />
      </div>
      <div v-if="currentTab === 'vix'">
        <lr-link-page src="https://quote.fx678.com/symbol/VIXDX" />
      </div>
      <div v-if="currentTab === 'goldTrend'">
        <lr-link-page src="https://quote.fx678.com/symbol/XAU" />
      </div>
      <div v-if="currentTab === 'shiborHistory'">
        <shibor-history />
      </div>
      <div v-if="currentTab === 'singleStockNotice'">
        <single-stock-notice />
      </div>
      <div v-if="currentTab === 'marketTheme'">
        <market-theme />
      </div>
      <div v-if="currentTab === 'economicData'">
        <lr-link-page src="http://data.eastmoney.com/cjsj/hbgyl.html"/>
      </div>
      <div v-if="currentTab === 'openAccountIndex'">
        <lr-link-page title="2019.03.19指数(17699)" src="http://index.baidu.com/v2/main/index.html#/trend/股票开户?words=股票开户" />
      </div>
      <div v-if="currentTab === 'farmProductIndex'">
        <farm-product-index />
      </div>
      <div v-if="currentTab === 'estateMarketHeat'">
        <estate />
      </div>
    </div>
  </div>
</template>

<script>
import singleStockNotice from './singleStockNotice.vue'
import farmProductIndex from './farmProductIndex.vue'
import marketTheme from './marketTheme.vue'
import shiborHistory from './shiborHistory.vue'
import estate from './estate.vue'

export default {
  components: {
    singleStockNotice,
    farmProductIndex,
    shiborHistory,
    marketTheme,
    estate
  },
  data() {
    return {
      currentTab: '美债收益率'
    }
  }
}
</script>
