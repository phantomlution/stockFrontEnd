<template>
  <lr-box style="position: relative;">
    <div slot="title">
      <el-button @click.stop="test">test</el-button>
      <el-button @click.stop="sortDiff">sortDiff</el-button>
      <el-button @click.stop="sortOriginalDiff">sortOriginalDiff</el-button>
      <span v-if="name" style="font-size: 14px;margin-right: 8px;">
        {{ name }}
      </span>
      <el-cascader v-model="current" filterable :options="optionList" clearable></el-cascader>
      <lr-date-picker v-model="date" pattern="stock" style="margin-left: 8px"></lr-date-picker>
    </div>
    <div >
      <stock-price-chart ref="chart" />
    </div>
    <lr-stick-bar title="分析助手" top="84px" :width="500">
      <keep-alive>
        <el-table sortable :data="tableData" @row-dblclick="setCurrent" max-height="120px">
          <el-table-column prop="name" label="name"></el-table-column>
          <el-table-column prop="diff" label="diff"></el-table-column>
          <el-table-column prop="startTime" label="startTime"></el-table-column>
          <el-table-column prop="maxTime" label="maxTime"></el-table-column>
          <el-table-column prop="originalDiff" label="originalDiff"></el-table-column>
        </el-table>
      </keep-alive>
    </lr-stick-bar>
  </lr-box>
</template>

<script>
import lodash from 'lodash'
import stockPriceChart from '@/views/stock/components/stockPriceChart.vue'
import { increment } from '@/utils'

export default {
  components: {
    stockPriceChart
  },
  data() {
    return {
      name: '',
      date: null,
      current: [],
      optionList: [],
      tableData: []
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
  },
  methods: {
    setCurrent(row) {
      this.date = this.$moment(row.date).toDate()
      this.current = ['concept', row.secid]
    },
    sortDiff() {
      const newList = lodash.sortBy(this.tableData, item => item.diff)
      newList.reverse()
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
      const date = '2019-12-31'

      const result = []
      Promise.all(conceptList.map(item => this.getFragmentDeal(date, item.value))).then(_ => {
        _.forEach(item => {
          if (item) {
            const plan = this.dynamicPlan(item)
            plan.date = date
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
          this.dynamicPlan(_)
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
      const pointList = data.filter(item => item.time >= '13:00')
      const planList = []
      for(let i=0; i<pointList.length; i++) {
        const model = {
          name,
          secid,
          "start": i,
          "startTime": pointList[i].time,
          "increment": 0,
          "maxIncrement": 0,
          "originalDiff": increment(pointList[pointList.length - 1].price, pre_close)
        }
        for(let j=model.start; j<pointList.length - 1; j++) {
          model['increment'] += (pointList[j + 1].price - pointList[j].price)
          if(model.increment > model.maxIncrement) {
            model.maxIncrement = model.increment
            model.maxTime = pointList[j + 1].time
            model.diff = lodash.round(model.maxIncrement * 100 / pre_close ,2)
          }
        }
        planList.push(model)
      }

      const maxItem = lodash.maxBy(planList, item => item.maxIncrement)

      return maxItem
    }
  }
}

</script>
