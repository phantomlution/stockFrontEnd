<template>
  <div v-loading="loading">
    <div style="text-align: center;margin-top: -16px">
      <el-radio-group v-model="currentTab">
        <el-radio-button label="base">基础信息</el-radio-button>
        <el-radio-button label="noticeChange">增减持</el-radio-button>
        <el-radio-button label="pledge">股票质押</el-radio-button>
        <el-radio-button label="deep">深度数据</el-radio-button>
      </el-radio-group>
    </div>
    <div style="padding: 16px" v-if="base">
      <div v-show="currentTab === 'base'">
        <el-form :inline="true">
          <el-row>
            <el-col :span="5">
              <el-form-item label="股票名称">{{ base.name }}</el-form-item>
            </el-col>
            <el-col :span="4">
              <el-form-item label="股票代码">{{ base.symbol }}</el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="5">
              <el-form-item label="总市值">{{ base.market_capital | capital}}</el-form-item>
            </el-col>
            <el-col :span="4">
              <el-form-item label="流动市值">{{ base.float_market_capital | capital }}</el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="5">
              <el-form-item label="质押比例(≤60%)">{{ pledgeRate }}%</el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="警戒线算法">质押市值/贷款 ≥ 1.35</el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item label="平仓线算法">质押市值/贷款 ≥ 1.2</el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="所属主题" style="color: rgba(0, 0, 0, 0.65);font-size: 14px">
                <el-tag v-for="(theme, themeIndex) of base.theme_list" :key="themeIndex">
                  {{ theme }}
                </el-tag>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="公司简介" style="color: rgba(0, 0, 0, 0.65);font-size: 14px">
                {{ base.company.org_cn_introduction || '-' }}
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="主营业务" style="color: rgba(0, 0, 0, 0.65);font-size: 14px">
                {{ base.company.main_operation_business || '-' }}
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="省份" style="color: rgba(0, 0, 0, 0.65);font-size: 14px">
                {{ base.company.provincial_name || '-' }}
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <div v-show="currentTab === 'noticeChange'">
        <notice-list :list="noticeChangeList" height="calc(100vh - 120px)"/>
      </div>
      <div v-show="currentTab === 'pledge'">
        <lr-link-page :src="`http://data.eastmoney.com/gpzy/detail/${rawCode}.html`" />
      </div>
      <div v-show="currentTab === 'deep'">
        <lr-link-page :src="`http://data.eastmoney.com/stockdata/${rawCode}.html`" />
      </div>
    </div>

  </div>
</template>

<script>
import lodash from 'lodash'
import noticeList from '@/views/stock/components/noticeList'

const props = {
  code: {
    type: String,
    required: true
  }
}

export default {
  props,
  components: {
    noticeList
  },
  data() {
    return {
      currentTab: 'base',
      loading: true,
      noticeChangeList: [],
      base: null,
      pledgeRate: ''
    }
  },
  computed: {
    rawCode() {
      return this.code.substring(2)
    }
  },
  mounted() {
    Promise.all([
      this.loadBase(),
      this.loadPledgeRate(),
      this.loadChangeNoticeList()
    ]).then(_ => {
      this.loading = false
    }).catch(_ => {
      this.loading = false
    })
  },
  filters: {
    capital(val) {
      return `${ lodash.round(val / 10000 / 10000, 2)}亿`
    }
  },
  methods: {
    loadBase() {
      const code = this.code
      return this.$http.get(`/api/stock/base`, { code }).then(base => {
        this.base = base
      }).catch(_ => {
        console.error(_)
      })
    },
    loadPledgeRate() {
      const code = this.code
      return this.$http.get(`/api/stock/detail/pledge`, { code }).then(pledgeRate => {
        this.pledgeRate = pledgeRate
      }).catch(_ => {
        console.error(_)
      })

    },
    loadChangeNoticeList() {
      const code = this.code
      return this.$http.get(`/api/stock/notice/change`, { code }).then(list => {
        this.noticeChangeList = list
      }).catch(_ => {
        console.error(_)
      })
    }
  }
}
</script>
