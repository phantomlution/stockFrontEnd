<template>
  <div>
    <div style="margin-bottom: 16px">
      <el-select v-model="country" style="width: 100%">
        <el-option :label="item.label" :value="item.value" v-for="(item, itemIndex) of countryOptionList" :key="itemIndex"></el-option>
      </el-select>
    </div>
    <lr-box :title="title">
      <lr-chart ref="chart" />
    </lr-box>
  </div>
</template>

<script>
import securityData from '@/data/americanTreasurySecurities/2019_07_in_billion_dollar.js'

const header = securityData[0]
const dataMap = {}

for (let i=0; i<20; i++) {
  let row = securityData[i + 1]
  dataMap[row[0]] = row.filter((column, columnIndex) => columnIndex > 0).map((column, columnIndex) => {
    return {
      date: header[columnIndex + 1] + '-01',
      value: Number(column)
    }
  })
}

export default {
  data() {
    return {
      country: 'China, Mainland',
      countryOptionList: Object.keys(dataMap).map(item => ({ label: item, value: item }))
    }
  },
  computed: {
    title() {
      return `${ this.country } 美债持有量(单位：十亿美元)`
    }
  },
  watch: {
    country() {
      this.renderChart()
    }
  },
  mounted() {
    this.renderChart()
  },
  methods: {
    renderChart() {
      const country = this.country
      if (!country) {
        return
      }
      if (!dataMap[country]) {
        return this.$message.warning('数据项不存在')
      }
      const chart = this.$refs.chart.getChart()
      chart.source(dataMap[country])
      chart.line().position('date*value')
      chart.render()

    }
  }
}
</script>
