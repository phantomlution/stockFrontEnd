<template>
  <el-popover >
    <div style="width: 720px">
      <lr-list :data="list" max-height="300px">
        <template slot="table-column">
          <el-table-column label="名称" prop="name" width="100px"></el-table-column>
          <el-table-column label="概念">
            <template slot-scope="scope">
              <div class="lr-stock-concept__theme">
                <el-tag v-for="item of scope.row.base.theme_list" :key="item">{{ item }}</el-tag>
              </div>
            </template>
          </el-table-column>
        </template>
      </lr-list>
    </div>
    <el-button slot="reference">概念项</el-button>
  </el-popover>
</template>

<script>
export default {
  computed: {
    list() {
      const stockPoolList = this.$store.getters.stockPoolList
      return stockPoolList.filter(item => item.name.indexOf('指数') === -1)
    }
  }
}
</script>

<style lang="scss">
.lr-stock-concept__theme{
  .el-tag {
    margin-right: 8px;
  }
}
</style>
