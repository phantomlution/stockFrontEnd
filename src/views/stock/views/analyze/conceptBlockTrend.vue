<template>
  <div>
    <lr-chart ref="chart" />
  </div>
</template>

<script>
import lodash from 'lodash'

export default {
  data() {
    return {
      conceptItemList: [
        '券商概念', '黄金概念'
      ]
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    loadData() {
      this.$http.get(`/api/analyze/concept/block/trend`).then(_ => {
        this.renderChart(_)
      }).catch(_ => {
        console.error(_)
      })
    },
    renderChart(_) {
      const dataList = []
      _.forEach(item => {
        const date = item['date']
        const rankingList = item['ranking']
        this.conceptItemList.forEach(conceptName => {
          for(let i=0; i<rankingList.length; i++) {
            const rankingItem = rankingList[i]
            if (rankingItem.name === conceptName) {
              dataList.push({
                date,
                name: conceptName,
                type: conceptName,
                percent: rankingItem.percent,
                index: -1 * (i + 1)
              })
            }
          }
        })
      })
      const rankingLength = _[0]['ranking'].length
      const filterDataList = dataList.filter(item => {
        const realIndex = Math.abs(item.index)
        const filterCount = 5
        if (realIndex <= filterCount) {
          return true
        }
        if (realIndex >= (rankingLength - filterCount)){
          return true
        }
        return false
      })

//      const array_one = filterDataList.filter(item => item.type === this.conceptItemList[0])
//      const array_two = filterDataList.filter(item => item.type === this.conceptItemList[1])
//
//      const array_one_date_list = array_one.map(item => item.date)
//      const array_two_date_list = array_two.map(item => item.date)
//
//      const intersection = lodash.intersection(array_one_date_list, array_two_date_list)
//
//      const finalDataList = dataList.filter(item => {
//        return intersection.indexOf(item.date) !== -1
//      })
      const finalDataList = filterDataList
      const chart = this.$refs.chart.getChart()
      chart.source(finalDataList)
      chart.line().position('date*index').color('type')
      chart.render()
    }
  }
}
</script>
