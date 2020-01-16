<template>
  <div>
    <div style="margin-bottom: 8px">
      <el-button @click.stop="loadData">开始分析</el-button>
    </div>
    <lr-list :data="itemList" @change="itemChanged">
      <template slot="card" slot-scope="scope">
        <div>
          <lr-stock-detail-link :add="false" :code="scope.row.code" :name="scope.row.name" />
        </div>
        <div>
          {{scope.row.count}}/{{ scope.row.total }}
        </div>
      </template>
    </lr-list>
  </div>

</template>

<script>
import lodash from 'lodash'

export default {
  data() {
    return {
      itemList: []
    }
  },
  methods: {
    loadData() {
      this.$http.get(`/api/analyze/heat/report`).then(_ => {
        _ = lodash.sortBy(_, item => -1 * item.count / item.total)
        this.itemList = _
      }).catch(_ => {
        console.error(_)
      })
    },
    itemChanged(model) {
      this.$bus.$emit('searchStockDetail', model)
    }
  }
}
</script>
