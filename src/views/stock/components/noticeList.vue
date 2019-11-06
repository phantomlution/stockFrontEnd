<template>
  <div>
    <div style="display: flex">
      <div style="flex: 1">
        <el-radio-group v-model="filterType">
          <el-radio label="">全部</el-radio>
          <el-radio label="回购">回购</el-radio>
          <el-radio label="债券">债券相关</el-radio>
          <el-radio label="增减持">增减持</el-radio>
          <el-radio label="质押">质押</el-radio>
        </el-radio-group>
      </div>
      <div v-if="code">
        <el-link type="primary" :href="`http://data.eastmoney.com/notices/stock/${ code.substring(2) }.html`" target="_blank">查看更多公告</el-link>
      </div>
    </div>
    <el-table :data="displayList" :height="tableHeight" :default-sort="{prop: 'date', order: 'descending'}">
      <el-table-column label="名称" width="100px">
        <template slot-scope="scope">
          {{ scope.row.stock_name }}
        </template>
      </el-table-column>
      <el-table-column label="公告标题">
        <template slot-scope="scope">
          <el-link :type="scope.row.important ? 'danger' : ''" :underline="false" @click.stop="openNotice(scope.row)">{{ scope.row.title }}</el-link>
        </template>
      </el-table-column>
      <el-table-column label="类型" width="128px" show-overflow-tooltip>
        <template slot-scope="scope">
          {{ scope.row.type }}
        </template>
      </el-table-column>
      <el-table-column label="日期" prop="date" width="128px" sortable>
        <template slot-scope="scope">
          {{ scope.row.date | date }}
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
const props = {
  code: {
    type: String,
    default: ''
  },
  list: {
    type: Array,
    required: true
  },
  tableHeight: {
    type: String,
    default: ''
  }
}
export default {
  props,
  data() {
    return {
      filterType: ''
    }
  },
  computed: {
    displayList() {
      const filterType = this.filterType
      if (filterType === '债券') {
        return this.list.filter(item => item.filterType === this.filterType)
      } else if (filterType === '增减持') {
        return this.list.filter(item => {
          return item.title.indexOf('增持') !== -1 || item.title.indexOf('减持') !== -1
        })
      } else if (filterType === '质押') {
        return this.list.filter(item => {
          return item.title.indexOf('质押') !== -1
        })
      } else if(filterType === '回购') {
        return this.list.filter(item => {
          return item.title.indexOf('回购') !== -1
        })
      }
      return this.list
    }
  },
  methods: {
    openNotice(row) {
      let url = ''
      if (row.url) {
        url = row.url
      } else {
        const code = row.stock_code.substring(2)
        url = `http://data.eastmoney.com/notices/stock/${ code }.html`
      }

      window.open(url, '_blank')
    },
    filterTypeHandler(type, row) {

      console.log(type)
      if (!type) {
        return true
      } else {
        return row.filterType === type
      }
    }
  }
}
</script>
