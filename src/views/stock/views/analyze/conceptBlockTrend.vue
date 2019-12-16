<template>
  <div>
    <div>
      <lr-date-picker v-model="date" pattern="stock" @change="loadData" />
    </div>
    <el-table :data="itemList">
      <el-table-column type="index" label="序号" ></el-table-column>
      <el-table-column prop="name" label="名称">
        <template slot-scope="scope">
          <el-button type="text" @click.stop="toItem(scope.row.url)">{{ scope.row.name }}</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="percent" label="幅度">
        <template slot-scope="scope">
          {{ scope.row.percent }}%
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>

export default {
  data() {
    return {
      itemList: [],
      date: this.$moment().format('YYYY-MM-DD')
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    loadData() {
      if (!this.date) {
        return
      }
      this.itemList = []
      this.$http.get(`/api/data/block/concept/ranking`, {
        date: this.$moment(this.date).format('YYYY-MM-DD')
      }).then(_ => {
        this.itemList = _
      }).catch(_ => {
        console.error(_)
      })
    },
    toItem(url) {
      window.open(url, '_blank')
    }
  }
}
</script>
