<template>
  <div>
    <el-button @click.stop="analyze">开始分析</el-button>
    <lr-list :data="conceptList" maxHeight="200px">
      <template slot="table-column">
        <el-table-column prop="name" label="name" ></el-table-column>
      </template>
    </lr-list>
  </div>
</template>

<script>
import lodash from 'lodash'
import { object2List } from '@/utils'

export default {
  data() {
    return {
      conceptList: []
    }
  },
  methods: {
    analyze() {
      const days = 22
      const topLimit = 10 // 名次
      this.getMarketOpenDateList().then(dateList => {
        const targetDateList = lodash.takeRight(dateList, days)
        // 提取排行榜数据
        this.$http.put(`/api/data/concept/ranking`, {
          dateList: targetDateList
        }).then(rankingList => {
          const rankPool = []
          console.log(rankingList)
          rankingList.forEach(rankingItem => {
            const topN = lodash.take(rankingItem.ranking, topLimit)
            topN.forEach(topItem => {
              if(topItem.name.indexOf('昨日') === -1) {
                rankPool.push(topItem)
              }
            })
          })

          // 提取上面排名中出现最多的概念
          const rankingGroup = lodash.groupBy(rankPool, item => item.name)
          const sortedRanking = lodash.sortBy(object2List(rankingGroup), item => item.value.length)
          sortedRanking.reverse()

          // 进入排行榜的最小个数（可能出现第五名有多个概念板块并列的情况）
          const minLength = sortedRanking[topLimit - 1].value.length
          const lastRankingResult = sortedRanking.filter(item => item.value.length >= minLength)

          const conceptNameList = lastRankingResult.map(item => item.key)
          console.log(conceptNameList)

          this.conceptList = conceptNameList.map(item => {
            return {
              name: item
            }
          })
        })
      })
    },
    getMarketOpenDateList() {
      return this.$http.get('/api/data/recent/market/open')
    }
  }
}

</script>
