<template>
  <lr-box v-if="dataList.length > 0">
    共{{ dataList.length }}条
    <vue-good-table :columns="columns" :rows="dataList" :line-numbers="true" maxHeight="300px" :fixedHeader="true" :sortOptions="sortOptions">
      <template slot="table-row" slot-scope="props">
        <template v-if="props.column.field === 'code'">
          <span>{{ props.row.code }}({{ props.row.name}}),{{ props.row.targetDate }},{{ props.row.profit }}%</span>
          <el-button type="text" @click.stop="showDetail(props.row.code)">查看</el-button>
        </template>
        <template v-else-if="props.column.field === 'makeShort'">
          {{ props.row.makeShort}},(总空:{{ props.row.totalMakeShort }},总多{{ props.row.totalMakeLong }})
        </template>
        <!--<template v-else-if="props.column.field === 'dayTrend'">-->
          <!--前日：{{ props.row.lastTwoDayTrend }}，昨日：{{ props.row.lastOneDayTrend }},-->
        <!--</template>-->
        <template v-else-if="props.column.field === 'closeIncrement'">
          {{ props.row.close}}({{ props.row.closeIncrement}}%)
        </template>
        <template v-else>
          {{props.formattedRow[props.column.field]}}
        </template>
      </template>
    </vue-good-table>
  </lr-box>
</template>

<script>
import lodash from 'lodash'
export default {
  data() {
    return {
      columns: [
        { label: 'code', field: 'code' },
        { label: 'makeShort', field: 'makeShort', type: 'number' },
        { label: 'notMakeShort', field: 'notMakeShort', type: 'number' },
        { label: 'lastDiff', field: 'lastDiff', type: 'number' },
//        { label: 'dayTrend', field: 'dayTrend' },
        { label: 'closeIncrement', field: 'closeIncrement', type: 'number' },
        { label: 'close', field: 'close', type: 'number', hidden: 'true' },
        { label: 'minClose', field: 'minClose', type: 'number' },
        { label: 'ceilingCount', field: 'ceilingCount', type: 'number', hidden: true },
        { label: 'totalMakeShort', field: 'totalMakeShort', type: 'number', hidden: true }
      ],
      sortOptions: {
        enabled: true,
        initialSortBy: [
          { field: 'closeIncrement', type: 'asc' },
          { field: 'totalMakeShort', type: 'desc' },
          { field: 'makeShort', type: 'desc' },
          { field: 'notMakeShort', type: 'asc' }
        ]
      },
      dataList: []
    }
  },
  mounted() {
    this.$bus.$on('analyzeMakeShort', data => {
      const dataList = data
//        .filter(item => !item.isMakeShort)
//        .filter(item => item.notMakeShort === 1)
//        .filter(item => item.lastOneDayTrend > 0 && item.lastTwoDayTrend > 0)
        .filter(item => item.close > 4)
//        .filter(item => item.makeShort >= 1)
//        .filter(item => item.notMakeShort <= 1) // 保证时效性
//        .filter(item => item.lastDiff >= -75 && item.lastDiff <= -10) // 排除某一些情况下的垃圾股票
        .filter(item => item.closeIncrement <= 30)

//        .filter(item => item.lastOneDayTrend > 1 && item.lastTwoDayTrend > 1) // 保证最低回升速度

      console.log('\naverage is :')
      console.log(dataList.length)
      console.log(lodash.round(lodash.mean(dataList.map(item => item.profit)),2))
      console.log('\n1 ')

      this.dataList = lodash.takeRight(dataList, 100)

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
    }
  }
}
</script>
