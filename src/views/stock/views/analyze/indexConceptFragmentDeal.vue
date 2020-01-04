<template>
  <lr-box>
    <div slot="title">
      <span v-if="name" style="font-size: 14px;margin-right: 8px;">
        {{ name }}
      </span>
      <el-cascader v-model="current" filterable :options="optionList" clearable></el-cascader>
      <lr-date-picker v-model="date" pattern="stock" style="margin-left: 8px"></lr-date-picker>
    </div>
    <div>
      <stock-price-chart ref="chart" />
    </div>
  </lr-box>
</template>

<script>
import lodash from 'lodash'
import stockPriceChart from '@/views/stock/components/stockPriceChart.vue'

export default {
  components: {
    stockPriceChart
  },
  data() {
    return {
      name: '',
      date: null,
      current: [],
      optionList: []
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
    reload() {
      this.loadData()
    },
    loadData() {
      if (this.date && this.current.length == 2) {
        const date = this.$moment(this.date).format('YYYY-MM-DD')
        const secid = this.current[1]

        this.$http.get(`/api/data/sync/fragment/deal`, {
          date,
          secid
        }).then(_ => {
          if (!_) {
            return this.$message.warning('没有相关数据')
          }
          this.name = _.name
          this.$refs.chart.updateChart(_.data, _.pre_close)
        })
      }
    },
    getOptionList() {
      this.$http.get(`/api/data/sync/item/list`).then(_ => {
        const group = lodash.groupBy(_, item => item.type)

        const optionList = Object.keys(group).map(key => {
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

        this.optionList = optionList
      })
    }
  }
}

</script>
