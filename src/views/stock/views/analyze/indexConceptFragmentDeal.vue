<template>
  <lr-box style="position: relative;">
    <div slot="title">
      <el-button @click.stop="test">test</el-button>
      <el-date-picker v-model="testDate" ></el-date-picker>
      <el-button @click.stop="sort('diff', true)">diff, ascending</el-button>
      <el-button @click.stop="sort('diff')">diff, descending</el-button>
      <span v-if="name" style="font-size: 14px;margin-right: 8px;">
        {{ name }}
      </span>
      <el-cascader v-model="current" filterable :options="optionList" clearable></el-cascader>
      <lr-date-picker v-model="date" pattern="stock" style="margin-left: 8px"></lr-date-picker>
    </div>
    <div>
      <div >
        <stock-price-chart ref="chart" />
      </div>
      <lr-stick-bar title="分析助手" top="84px" width="500">
        <el-table sortable :data="tableData" @row-dblclick="setCurrent" max-height="320px">
          <el-table-column type="index"></el-table-column>
          <el-table-column prop="name" label="name"></el-table-column>
          <el-table-column prop="count" label="count" ></el-table-column>
          <el-table-column prop="diff" label="diff"></el-table-column>
        </el-table>
      </lr-stick-bar>
      <div>
        <bulk-stock-comparison ref="compare"></bulk-stock-comparison>
      </div>
    </div>

  </lr-box>
</template>

<script>
import lodash from 'lodash'
import stockPriceChart from '@/views/stock/components/stockPriceChart.vue'
import { increment } from '@/utils'
import bulkStockComparison from '@/views/stock/components/bulkStockComparison.vue'

export default {
  components: {
    stockPriceChart,
    bulkStockComparison
  },
  data() {
    return {
      name: '',
      date: null,
      testDate: this.$moment('2019-12-31').toDate(),
      current: [],
      optionList: [],
      tableData: [],
      themeList: []
    }
  },
  watch: {
    current() {
      this.reload()
    },
    date() {
      this.reload()
    }
  },
  mounted() {
    this.getOptionList()
    this.$store.dispatch('getThemeList').then(themeList => {
      this.themeList = themeList
    })
  },
  methods: {
    setCurrent(row) {
      this.date = this.$moment(row.date).toDate()
      this.current = ['concept', row.secid]
    },
    sort(field, reverse=false) {
      const newList = lodash.sortBy(this.tableData, item => item[field])
      if (reverse) {
        newList.reverse()
      }
      this.tableData = newList
    },
    sortOriginalDiff() {
      const newList = lodash.sortBy(this.tableData, item => item.originalDiff)
      newList.reverse()
      this.tableData = newList
    },
    reload() {
      this.loadData()
    },
    test() {
      const conceptList = this.optionList[1].children
      const date = this.$moment(this.testDate).format('YYYY-MM-DD')

      const result = []
      Promise.all(conceptList.map(item => this.getFragmentDeal(date, item.value))).then(_ => {
        const themeList = this.themeList
        _.forEach(item => {
          if (item) {
            const plan = this.dynamicPlan(item)
            plan.date = date
            const themeItem = themeList.find(theme => theme.name === item.name)
            if (themeItem) {
              plan.count = themeItem.list.length
            } else {
              console.warn(plan)
              plan.count = 0
            }
            if (plan.count > 200) {
              return
            }
            if (item.name.indexOf('昨日') !== -1) {
              return
            }
            result.push(plan)
          }
        })

        this.tableData = result
      })
    },
    getFragmentDeal(date, secid) {
      return this.$http.get(`/api/data/sync/fragment/deal`, {
        date,
        secid
      })
    },
    loadData() {
      if (this.date && this.current.length == 2) {
        const date = this.$moment(this.date).format('YYYY-MM-DD')
        const secid = this.current[1]

        this.getFragmentDeal(date, secid).then(_ => {
          if (!_) {
            return this.$message.warning('没有相关数据')
          }
          this.name = _.name
          this.$refs.chart.updateChart(_.data, _.pre_close)

          const themeItem = this.themeList.find(item => item.name === _.name)
          if (!themeItem) {
            return this.$message.error('找不到对应的板块信息')
          }

          this.$refs.compare.analyze(themeItem.list, date)
        })
      }
    },
    getOptionList() {
      this.$http.get(`/api/data/sync/item/list`).then(_ => {
        const group = lodash.groupBy(_, item => item.type)
        this.optionList = Object.keys(group).map(key => {
          let label = ''
          if (key === 'index') {
            label = '指数'
          } else if (key === 'concept') {
            label = '板块'
          }

          return {
            label,
            value: key,
            children: group[key].map(item => ({ label: item.name, value: item.secid }))
          }
        })
      })
    },
    dynamicPlan({ data, name, secid, pre_close }) {
      const pointList = data

      const model = {
        name,
        secid,
        diff: increment(data[data.length - 1].price, pre_close)
      }

      return model
    }
  }
}

</script>
