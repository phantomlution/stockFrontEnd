<template>
  <div>
    <div>
      <el-radio-group v-model="filterType">
        <el-radio label="">全部</el-radio>
        <el-radio label="债券">债券相关</el-radio>
      </el-radio-group>
    </div>
    <el-table :data="displayList" :height="height" :default-sort="{prop: 'date', order: 'descending'}">
      <el-table-column label="名称" width="100px">
        <template slot-scope="scope">
          {{ scope.row.stock_name }}
        </template>
      </el-table-column>
      <el-table-column label="公告标题">
        <template slot-scope="scope">
          <el-link :type="scope.row.important ? 'danger' : ''" :underline="false">{{ scope.row.title }}</el-link>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="64px">
        <template slot-scope="scope">
          <el-button type="text" @click.stop="openNotice(scope.row)">查看</el-button>
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
  list: {
    type: Array,
    required: true
  },
  height: {
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
      if (!this.filterType) {
        return this.list
      } else {
        return this.list.filter(item => item.filterType === this.filterType)
      }
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
