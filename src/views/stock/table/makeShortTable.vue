<template>
  <lr-box>
    <div>
      <el-form :inline="true">
        <el-form-item label="总记录数">
          {{ dataList.length }}
        </el-form-item>
        <el-form-item label="流量回归">
          <el-switch v-model="flowReturn"  />
        </el-form-item>
        <el-form-item label="连续点个数">
          <el-input-number v-model="continuousCount" :min="3" />
        </el-form-item>
      </el-form>
    </div>
    <vue-good-table :columns="columns" :rows="dataList" :line-numbers="true" maxHeight="300px" :sortOptions="sortOptions">
      <template slot="table-row" slot-scope="props">
        <template v-if="props.column.field === 'code'">
          <span>(L{{ props.row.rank}},{{ props.row.diffIncrement }}%){{ props.row.code }}({{ props.row.name}}),{{ props.row.targetDate }},{{ props.row.profit }}%</span>
          <el-button type="text" @click.stop="showDetail(props.row.code)">查看</el-button>
          <span>{{ props.row.bounceRate }}</span>
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
      flowReturn: true, // 是否考虑流量回归
      continuousCount: 5, // 连续数据点个数
      columns: [
        { label: 'code', field: 'code' },
        { label: 'secondPhaseCount', field: 'secondPhaseCount', type: 'number', hidden: 'true' },
        { label: 'lastDiff', field: 'lastDiff', type: 'number' },
        { label: 'profit', field: 'profit', type: 'number', hidden: 'true' },
        { label: 'closeIncrement', field: 'closeIncrement', type: 'number' },
        { label: 'close', field: 'close', type: 'number', hidden: 'true' },
        { label: 'bounceRate', field: 'bounceRate', type: 'number', hidden: 'true' },
        { label: 'rank', field: 'rank', type: 'number', hidden: 'true' },
        { label: 'diffIncrement', field: 'diffIncrement', type: 'number', hidden: 'true'}
      ],
      sortOptions: {
        enabled: true,
        initialSortBy: [
          { field: 'rank', type: 'desc' },
          { field: 'secondPhaseCount', type: 'desc' },
          { field: 'close', type: 'desc' },
//          { field: 'diffIncrement', type: 'desc' },
//          { field: 'closeIncrement', type: 'asc' },
//          { field: 'bounceRate', type: 'asc' }
        ]
      },
      dataList: []
    }
  },
  watch: {
    flowReturn() {
      this.refresh()
    },
    continuousCount() {
      this.refresh()
    }
  },
  mounted() {
    this.$bus.$on('analyzeMakeShort', data => {
      /**
       * 分级
       */
      data.forEach(item => {
        item.rank = 0

        const recentItemLength = item.recentItemList.length
        let positiveTrendCount = 0
        let continuousCount = this.continuousCount

        // 计算热度
        item.diffIncrement = item.recentItemList[recentItemLength - 1].diff - item.recentItemList[recentItemLength - 6].diff
        item.diffIncrement = Math.ceil(item.diffIncrement)

        if (recentItemLength >= continuousCount) {
          for(let i = recentItemLength - 1; i > recentItemLength - continuousCount; i--) {
            let result = item.recentItemList[i].diff - item.recentItemList[i - 1].diff > 0 ? 1 : 0
            if (result === 1) {
              positiveTrendCount++
            }
          }
          if (positiveTrendCount >= (continuousCount - 2)) {
            item.rank = 3
          }
        }
      })


      let firstRoundDataList = data
        .filter(item => item.close >= STOCK_PRICE_MIN)
        .filter(item => item.close <= STOCK_PRICE_MAX)
        .filter(item => item.diffIncrement > 0)
        .filter(item => item.secondPhaseCount > 0) // 必须存在二阶段的点
        .filter(item => item.closeIncrement <= 3)

      // 考虑流量回归模型
      if (this.flowReturn) {
        firstRoundDataList = firstRoundDataList.filter(item => item.rank === 3)
      }

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
    refresh() {
      this.$bus.$emit('restartAnalyzeProbability')
    },
    showDetail(code) {
      this.$bus.$emit('searchStockDetail', {
        code
      })
    }
  }
}
</script>
