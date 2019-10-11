<template>
  <el-table :data="list" :height="height" :default-sort="{prop: 'date', order: 'descending'}">
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
  methods: {
    openNotice(row) {
      window.open(row.url)
    }
  }
}
</script>
