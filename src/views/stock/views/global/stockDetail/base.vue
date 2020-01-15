<template>
  <div v-if="base">
    <el-row>
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
            <el-form-item label="总市值">{{ base.market_capital | amount }}</el-form-item>
          </el-col>
          <el-col :span="9">
            <el-form-item label="流动市值">{{ base.float_market_capital | amount }}</el-form-item>
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
            <div >
              <el-popover width="540" placement="right-start">
                <el-table :data="base.restrict_sell_list" max-height="360px">
                  <el-table-column prop="date" label="日期" width="100"></el-table-column>
                  <el-table-column prop="increment" label="解禁数量(股)">
                    <template slot-scope="scope">
                      {{ scope.row.increment | amount }}
                    </template>
                  </el-table-column>
                  <el-table-column prop="desc" label="变动原因"></el-table-column>
                </el-table>
                <el-link type="danger" slot="reference">限售解禁&nbsp;&nbsp;股本结构<i class="el-icon-bottom" /></el-link>
                <!--<el-link type="danger" :href="`http://f10.eastmoney.com/CapitalStockStructure/Index?type=web&code=${ code }`" target="_blank" >限售解禁&nbsp;&nbsp;股本结构<i class="el-icon-bottom" /></el-link>-->
              </el-popover>
            </div>
            <div v-if="base.restrict_sell_list">
              <lr-date-time-line :dateList="base.restrict_sell_list" />
            </div>
          </el-col>
        </el-row>
        <el-row>
          <el-col :span="24">
            <el-form-item class="lr-stock-detail-theme" label="所属主题">
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
</template>

<script>
const props = {
  code: {
    type: String,
    required: true
  }
}

export default {
  props,
  data() {
    return {
      base: null,
      pledgeRate: ''
    }
  },
  mounted() {
    this.loadBase()
    this.loadPledgeRate()
  },
  methods: {
    loadBase() {
      const code = this.code
      return this.$http.get(`/api/data/base`, { code }).then(base => {
        this.base = base
        // 异步加载各个股东，其他持股的公司
        base.stock_holder_list = base.stock_holder_list || []
        base.stock_holder_list.forEach(holder => {
          let url = holder.company_href
          if (!url) {
            return
          }
          this.$http.get('/api/stock/share/all', { url }).then(_ => {
            this.$set(holder, 'stock_list', _)
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
  }
}

</script>

<style lang="scss">
.lr-stock-detail-theme{
  .el-tag {
    margin-right: 8px;
  }
}
</style>
