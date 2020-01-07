<template>
  <el-drawer title="个股详情" size="90%" :visible.sync="drawerVisible">
    <div>
      <div style="text-align: center;position: absolute;width: 100%;background: #FFFFFF;z-index: 999">
        <el-radio-group v-model="currentTab">
          <el-radio-button label="基础信息">基础信息</el-radio-button>
          <el-radio-button label="趋势分析">趋势分析</el-radio-button>
          <el-radio-button label="实时走势">实时走势</el-radio-button>
          <el-radio-button label="公告列表">公告列表</el-radio-button>
          <el-radio-button label="股票质押">股票质押</el-radio-button>
          <el-radio-button label="深度数据">深度数据</el-radio-button>
        </el-radio-group>
      </div>

      <div style="padding: 40px 16px 16px 16px;">
        <div v-if="currentTab === '基础信息'">
          <stock-base :code="code" />
        </div>
        <div v-if="currentTab === '趋势分析'">
          <stock-trend :code="code" />
        </div>
        <div v-if="currentTab === '实时走势'">
          <stock-live :code="code" />
        </div>
        <div v-if="currentTab === '公告列表'">
          <stock-notice :code="code" />
        </div>
        <div v-if="currentTab === '股票质押'">
          <stock-pledge :code="code" />
        </div>
        <div v-if="currentTab === '深度数据'">
          <stock-deep :code="code" />
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<script>
import stockBase from './base.vue'
import stockDeep from './deep.vue'
import stockLive from './live.vue'
import stockNotice from './notice.vue'
import stockPledge from './pledge.vue'
import stockTrend from './trend.vue'

export default {
  components: {
    stockBase,
    stockDeep,
    stockLive,
    stockNotice,
    stockPledge,
    stockTrend
  },
  data() {
    return {
      drawerVisible: false,
      code: '',
      currentTab: ''
    }
  },
  watch: {
    drawerVisible(val) {
      if (!val) {
        this.code = ''
        this.currentTab = ''
      }
    }
  },
  mounted() {
    this.$bus.$on('showStockDetail', ({ code, tab = '基础信息' }) => {
      this.code = code
      this.currentTab = tab
      this.drawerVisible = true
    })
  }
}
</script>
