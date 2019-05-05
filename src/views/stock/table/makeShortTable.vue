<template>
  <lr-box v-if="dataList.length > 0">
    <vue-good-table :columns="columns" :rows="dataList" maxHeight="300px" :sortOptions="sortOptions">
      <template slot="table-row" slot-scope="props">
        <template v-if="props.column.field == 'code'">
          <span>{{props.row.code}}</span>
          <el-button type="text" @click.stop="showDetail(props.row.code)">查看</el-button>
        </template>
        <template v-else>
          {{props.formattedRow[props.column.field]}}
        </template>
      </template>
    </vue-good-table>
  </lr-box>
</template>

<script>
export default {
  data() {
    return {
      columns: [
        { label: 'code', field: 'code' },
        { label: 'name', field: 'name' },
        { label: 'makeShort', field: 'makeShort', type: 'number' },
        { label: 'makeLong', field: 'makeLong', type: 'number' }
      ],
      sortOptions: {
        enabled: true,
        initialSortBy: [
          { field: 'makeShort', type: 'desc' },
          { field: 'makeLong', type: 'asc' }
        ]
      },
      dataList: []
    }
  },
  mounted() {
    this.$bus.$on('analyzeMakeShort', data => {
      this.dataList = data
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
