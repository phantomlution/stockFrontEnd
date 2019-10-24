<template>
  <div>
    <el-radio-group v-model="currentTab" style="width: 100%;text-align: center;margin-bottom: 16px">
      <el-radio-button label="中国外汇储备">中国外汇储备</el-radio-button>
      <el-radio-button label="各国美债持有量">各国美债持有量</el-radio-button>
      <el-radio-button label="国家统计局">国家统计局</el-radio-button>
      <el-radio-button label="通胀率">通胀率</el-radio-button>
      <el-radio-button label="中国M2年率">中国M2年率</el-radio-button>
      <el-radio-button label="中国GDP年率">中国GDP年率</el-radio-button>
      <el-radio-button label="中国CPI">中国CPI</el-radio-button>
      <el-radio-button label="其他数据">其他数据</el-radio-button>
    </el-radio-group>
    <div v-show="currentTab === '中国外汇储备'">
      <lr-link-page src="https://rl.fx678.com/id/112015032410015421.html" />
    </div>
    <div v-if="currentTab === '各国美债持有量'">
      <treasury-security />
    </div>
    <div v-if="currentTab === '国家统计局'">
      <country-stat />
    </div>
    <div v-show="currentTab === '通胀率'">
      <currency-inflation />
    </div>
    <div v-show="currentTab === '中国M2年率'">
      <lr-link-page src="https://rl.fx678.com/id/112015032410000077.html" />
    </div>
    <div v-show="currentTab === '中国GDP年率'">
      <lr-link-page src="https://rl.fx678.com/id/112015032410012492.html" />
    </div>
    <div v-show="currentTab === '中国CPI'">
      <lr-link-page src="https://rl.fx678.com/id/112015032410000067.html" />
    </div>
    <div v-if="currentTab === '其他数据'">
      <self-service />
    </div>
  </div>
</template>

<script>
import selfService from './selfService.vue'
import currencyInflation from './currencyInflation.vue'
import treasurySecurity from './treasurySecurity.vue'
import countryStat from './countryStat/index.vue'

export default {
  components: {
    selfService,
    currencyInflation,
    treasurySecurity,
    countryStat
  },
  data() {
    return {
      currentTab: '中国外汇储备'
    }
  },
}
</script>
