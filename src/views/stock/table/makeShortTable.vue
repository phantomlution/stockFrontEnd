<template>
  <lr-box>
    共{{ dataList.length }}条
    <vue-good-table :columns="columns" :rows="dataList" :line-numbers="true" maxHeight="300px" :fixedHeader="true" :sortOptions="sortOptions">
      <template slot="table-row" slot-scope="props">
        <template v-if="props.column.field === 'code'">
          <span>(L{{ props.row.rank}},{{ props.row.diffIncrement }}){{ props.row.code }}({{ props.row.name}}),{{ props.row.targetDate }},{{ props.row.profit }}%</span>
          <el-button type="text" @click.stop="showDetail(props.row.code)">查看</el-button>
          <span>{{ props.row.bounceRate }}</span>
        </template>
        <template v-else-if="props.column.field === 'secondPhaseCount'">
          <el-button type="text" @click.stop="showSecondPhaseDetail(props.row)">
            <template v-if="props.row.secondPhaseCount > 0">
              是
            </template>
            <template v-else>
              否
            </template>
          </el-button>
        </template>
        <template v-else-if="props.column.field === 'closeIncrement'">
          {{ props.row.close}}({{ props.row.closeIncrement}}%)
        </template>
        <template v-else>
          {{props.formattedRow[props.column.field]}}
        </template>
      </template>
    </vue-good-table>

    <!--<plot ref="plot" />-->
  </lr-box>
</template>

<script>
import lodash from 'lodash'
import { STOCK_PRICE_MIN, STOCK_PRICE_MAX } from '@/utils/stock'
//import plot from './makeShortPlot.vue'

export default {
  components: {
//    plot
  },
  data() {
    return {
      columns: [
        { label: 'code', field: 'code' },
        { label: 'secondPhaseCount', field: 'secondPhaseCount', type: 'number' },
        { label: 'lastDiff', field: 'lastDiff', type: 'number' },
        { label: 'profit', field: 'profit', type: 'number', hidden: 'true' },
        { label: 'closeIncrement', field: 'closeIncrement', type: 'number' },
        { label: 'close', field: 'close', type: 'number', hidden: 'true' },
        { label: 'minClose', field: 'minClose', type: 'number' },
        { label: 'bounceRate', field: 'bounceRate', type: 'number', hidden: 'true' },
        { label: 'rank', field: 'rank', type: 'number', hidden: 'true' },
        { label: 'diffIncrement', field: 'diffIncrement', type: 'number', hidden: 'true'}
      ],
      sortOptions: {
        enabled: true,
        initialSortBy: [
          { field: 'rank', type: 'desc' },
          { field: 'secondPhaseCount', type: 'desc' },
//          { field: 'profit', type: 'desc' },
          { field: 'diffIncrement', type: 'desc' },
          { field: 'closeIncrement', type: 'asc' },
          { field: 'bounceRate', type: 'asc' }
        ]
      },
      dataList: []
    }
  },
  mounted() {
    this.$bus.$on('analyzeMakeShort', data => {
      /**
       * 分级
       */
      data.forEach(item => {
        item.rank = 0
        item.diffIncrement = 0
        const recentItemLength = item.recentItemList.length
        let positiveTrendCount = 0
        if (recentItemLength >= 6) {
          for(let i = recentItemLength - 1; i > recentItemLength - 6; i--) {
            let result = item.recentItemList[i].diff - item.recentItemList[i - 1].diff > 0 ? 1 : 0
            if (result === 1) {
              positiveTrendCount++
            }
          }
          if (positiveTrendCount >= 4) {
            item.rank = 3
            // 规避热度已经非常高的
            if (item.recentItemList[recentItemLength - 1].diff <= 25) {
              item.diffIncrement = item.recentItemList[recentItemLength - 1].diff - item.recentItemList[recentItemLength - 6].diff
            }
          }
        }
      })


      const firstRoundDataList = data
        .filter(item => item.close >= STOCK_PRICE_MIN)
        .filter(item => item.close <= STOCK_PRICE_MAX)
        .filter(item => item.diffIncrement > 0)
        .filter(item => item.secondPhaseCount > 0)
        .filter(item => item.closeIncrement <= 15)

      // 为了精简点数，进行数据剔除(采用天地人三个数)
      let secondRoundDataList = firstRoundDataList

      const threePercentDataList = firstRoundDataList.filter(item => item.closeIncrement <= 3)
      const sixPercentDataList = firstRoundDataList.filter(item => item.closeIncrement <= 6)
      const ninePercentDataList = firstRoundDataList.filter(item => item.closeIncrement <= 9)
      if (threePercentDataList.length >= 100) {
        secondRoundDataList = threePercentDataList
      } else if (sixPercentDataList.length >= 100) {
        secondRoundDataList = sixPercentDataList
      } else if (ninePercentDataList.length >= 100) {
        secondRoundDataList = ninePercentDataList
      }

      const finalRoundDataList = secondRoundDataList
      this.dataList = finalRoundDataList

      const secondPhaseMap = this.$store.state.data.secondPhaseMap
      secondPhaseMap.clear()
      this.dataList.forEach(item => {
        secondPhaseMap.set(item.code, item)
      })
    })
  },
  beforeDestroy() {
    this.$bus.$off('analyzeMakeShort')
  },
  methods: {
    showDetail(code) {
      this.$bus.$emit('searchStockDetail', {
        code
      })
    },
    showSecondPhaseDetail(row) {
      console.log(row.secondPhaseResult)
    }
  }
}
</script>
