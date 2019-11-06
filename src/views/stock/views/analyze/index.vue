<template>
  <div>
    <el-radio-group v-model="currentTab" style="width: 100%;text-align: center;margin-bottom: 16px">
      <el-radio-button label="数据源列表">数据源列表</el-radio-button>
      <el-radio-button label="历史分时成交">历史分时成交</el-radio-button>
      <el-radio-button label="Shibor历史数据">Shibor历史数据</el-radio-button>
      <el-radio-button label="历史资金动向">历史资金动向</el-radio-button>
      <el-radio-button label="房产热度分析">房产热度分析</el-radio-button>
      <el-radio-button label="解禁分布">解禁分布</el-radio-button>
    </el-radio-group>

    <div>
      <div v-if="currentTab === '数据源列表'">
        <data-source />
      </div>
      <div v-if="currentTab === '历史分时成交'">
        <history-fragment-deal />
      </div>
      <div v-if="currentTab === '历史资金动向'">
        <capital-flow />
      </div>
      <div v-if="currentTab === 'Shibor历史数据'">
        <shibor-history />
      </div>
      <div v-if="currentTab === '房产热度分析'">
        <estate />
      </div>
      <div v-if="currentTab === '解禁分布'">
        <lr-restrict-sell />
      </div>
    </div>
  </div>
</template>

<script>
import LrRestrictSell from './restrictSell.vue'
import historyFragmentDeal from './historyFragmentDeal.vue'
import capitalFlow from './capitalFlow/index.vue'
import dataSource from './dataSource.vue'
import shiborHistory from './shiborHistory'
import estate from './estate.vue'

export default {
  components: {
    LrRestrictSell,
    historyFragmentDeal,
    capitalFlow,
    dataSource,
    shiborHistory,
    estate
  },
  data() {
    return {
      currentTab: '数据源列表'
    }
  }
}
</script>
