<template>
  <div v-loading="loading">
    <div style="text-align: center;margin-top: -16px">
      <el-radio-group v-model="currentTab">
        <el-radio-button label="base">基础信息</el-radio-button>
        <el-radio-button label="live">实时走势</el-radio-button>
        <el-radio-button label="noticeChange">公告列表</el-radio-button>
        <el-radio-button label="pledge">股票质押</el-radio-button>
        <el-radio-button label="deep">深度数据</el-radio-button>
      </el-radio-group>
    </div>
    <div style="padding: 16px" v-if="base">
      <div v-show="currentTab === 'base'" style="height: calc(100vh - 110px);overflow: auto">
        <el-row>
          <el-col :span="18">
            <el-form :inline="true">
              <el-row>
                <el-col :span="6">
                  <el-form-item label="股票名称">{{ base.name }}</el-form-item>
                </el-col>
                <el-col :span="9">
                  <el-form-item label="股票代码">{{ base.symbol }}</el-form-item>
                </el-col>
                <el-col :span="9">
                  <el-form-item label="省份">{{ base.company.provincial_name || '—' }}</el-form-item>
                </el-col>

              </el-row>
              <el-row>
                <el-col :span="6">
                  <el-form-item label="总市值">{{ base.market_capital | capital}}</el-form-item>
                </el-col>
                <el-col :span="9">
                  <el-form-item label="流动市值">{{ base.float_market_capital | capital }}</el-form-item>
                </el-col>
                <el-col :span="9">
                  <el-form-item label="工商信息">
                    <el-link type="warning" target="_blank" :href="base.qichacha_url">立即查看</el-link>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="6">
                  <el-form-item label="质押比例(≤60%)">{{ pledgeRate }}%</el-form-item>
                </el-col>
                <el-col :span="9">
                  <el-form-item label="警戒线算法">质押市值/贷款 ≥ 1.35</el-form-item>
                </el-col>
                <el-col :span="9">
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
            </el-form>
          </el-col>
          <el-col :span="6">
            <el-card>
              <div slot="header">
                <span>行情报价</span>
                <el-button style="float: right; padding: 3px 0" type="text" @click.stop="loadBiding">刷新</el-button>
              </div>
              <div v-for="(biding, $index) in bidingList" :key="$index">
                <div v-if="$index === 5">
                  &nbsp;
                </div>
                <el-row style="font-size: 14px; color: rgba(0, 0, 0, 0.65);line-height: 1.5">
                  <el-col :span="8">{{ biding[0] }} </el-col>
                  <el-col :span="8">{{ biding[1] }}</el-col>
                  <el-col :span="8">{{ biding[2] }}</el-col>
                </el-row>
              </div>
            </el-card>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <lr-box title="十大股东">
              <el-table :data="base.stock_holder_list">
                <el-table-column label="股东名称" show-overflow-tooltip>
                  <template slot-scope="scope">
                    <template v-if="scope.row.company_href">
                      <el-link type="primary" target="_blank" :href="`https://www.qichacha.com${scope.row.company_href}`">{{ scope.row.company_name }}</el-link>
                    </template>
                    <template v-else>
                      {{ scope.row.company_name }}
                    </template>
                  </template>
                </el-table-column>
                <el-table-column width="120px" label="持股比例" prop="stock_percent">
                  <template slot-scope="scope">
                    {{ scope.row.stock_percent }}%
                  </template>
                </el-table-column>
                <el-table-column label="A股持股公司" width="120px">
                  <template slot-scope="scope">
                    <template v-if="scope.row.stock_list">
                      <el-popover>
                        <el-table :data="scope.row.stock_list">
                          <el-table-column label="名称" prop="name"></el-table-column>
                          <el-table-column label="代码" prop="code"></el-table-column>
                        </el-table>
                        <el-button type="text" slot="reference">共{{ scope.row.stock_list.length }}个</el-button>
                      </el-popover>
                    </template>
                    <template v-else>-</template>
                  </template>
                </el-table-column>
              </el-table>
            </lr-box>
          </el-col>
          <el-col :span="12">
            <lr-box title="子公司">
              <el-table :data="base.sub_company_list">
                <el-table-column label="公司名称" show-overflow-tooltip>
                  <template slot-scope="scope">
                    <template v-if="scope.row.company_href">
                      <el-link type="primary" target="_blank" :href="`https://www.qichacha.com${scope.row.company_href}`">{{ scope.row.company_name }}</el-link>
                    </template>
                    <template v-else>
                      {{ scope.row.company_name }}
                    </template>
                  </template>
                </el-table-column>
                <el-table-column label="关系" prop="relation" width="100px"></el-table-column>
                <el-table-column width="80px" label="投资比例">
                  <template slot-scope="scope">
                    {{ scope.row.stock_share }}
                  </template>
                </el-table-column>
                <el-table-column label="主营业务" prop="main_business" width="100px"></el-table-column>
              </el-table>
            </lr-box>
          </el-col>
        </el-row>
      </div>
    </div>
    <div v-show="currentTab === 'noticeChange'">
      <notice-list :list="noticeChangeList" height="calc(100vh - 130px)"/>
    </div>
    <div v-if="currentTab === 'pledge'">
      <lr-link-page :src="`http://data.eastmoney.com/gpzy/detail/${rawCode}.html`" />
    </div>
    <div v-if="currentTab === 'deep'">
      <lr-link-page :src="`http://data.eastmoney.com/stockdata/${rawCode}.html`" />
    </div>
    <div v-if="currentTab === 'live'">
      <lr-link-page :src="`http://quote.eastmoney.com/concept/${code}.html?from=classic`" />
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
      bidingList: [],
      base: null,
      pledgeRate: ''
    }
  },
  computed: {
    rawCode() {
      return this.code.substring(2)
    },
    loading() {
      return !this.base
    }
  },
  mounted() {
    Promise.all([
      this.loadBase(),
      this.loadPledgeRate(),
      this.loadBiding(),
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
        // 异步加载各个股东，其他持股的公司
        base.stock_holder_list.forEach(holder => {
          let url = holder.company_href
          if (!url) {
            return
          }
          this.$http.get('/api/stock/share/all', { url }).then(_ => {
            this.$set(holder, 'stock_list', _)
            console.log(_)
          }).catch(_ => {
            console.error(_)
          })
        })
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
      return this.$http.get(`/api/stock/notice`, { code }).then(list => {
        this.noticeChangeList = list
      }).catch(_ => {
        console.error(_)
      })
    },
    loadBiding() {
      const code = this.code
      return this.$http.get(`/api/stock/detail/biding`, { code }).then(response => {
        this.bidingList = response['biding']
      })
    }
  }
}
</script>
