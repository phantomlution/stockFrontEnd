<template>
  <div>
    <el-radio-group v-model="currentTab" style="width: 100%;text-align: center;margin-bottom: 16px">
      <el-radio-button label="数据源列表">数据源列表</el-radio-button>
      <el-radio-button label="历史分时数据">历史分时数据</el-radio-button>
      <el-radio-button label="surgeForShort">surgeForShort</el-radio-button>
      <el-radio-button label="Shibor历史数据">Shibor历史数据</el-radio-button>
      <el-radio-button label="房产热度分析">房产热度分析</el-radio-button>
    </el-radio-group>

    <div>
      <div v-if="currentTab === '数据源列表'">
        <data-source />
      </div>
      <div v-if="currentTab === '历史分时数据'">
        <history-fragment />
      </div>
      <div v-if="currentTab === 'surgeForShort'">
        <surge-for-short />
      </div>
      <div v-if="currentTab === 'Shibor历史数据'">
        <shibor-history />
      </div>
      <div v-if="currentTab === '房产热度分析'">
        <estate />
      </div>
    </div>
  </div>
</template>

<script>
import dataSource from './dataSource.vue'
import shiborHistory from './shiborHistory'
import estate from './estate.vue'
import surgeForShort from './surgeForShort/index.vue'
import historyFragment from './historyFragment.vue'

export default {
  components: {
    dataSource,
    shiborHistory,
    estate,
    historyFragment,
    surgeForShort
  },
  data() {
    return {
      currentTab: '数据源列表'
    }
  }
}
</script>
