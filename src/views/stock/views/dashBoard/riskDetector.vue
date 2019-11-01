<template>
  <el-popover width="540" placement="right-start">
    <el-table :data="riskList">
      <el-table-column label="代码" prop="code" width="200px">
        <template slot-scope="scope">
          <lr-stock-detail-link :code="scope.row.code" :name="scope.row.name" :add="false" />
        </template>
      </el-table-column>
      <el-table-column label="风险">
        <template slot-scope="scope">
          <el-tag size="large" :type="scope.row.risk.type">{{ scope.row.risk.message }}</el-tag>
        </template>
      </el-table-column>
    </el-table>
    <el-badge slot="reference" :value="riskList.length" class="item" type="warning">
      <el-button >相关风险</el-button>
    </el-badge>
  </el-popover>
</template>

<script>
export default {
  data() {
    return {
      riskList: []
    }
  },
  methods: {
    collect(stockItemList) {
      const riskList = []
      stockItemList.forEach(item => {
        item.riskList.forEach(riskItem => {
          riskList.push({
            code: item.code,
            name: item.name,
            risk: riskItem
          })
        })
      })
      this.riskList = riskList
    },
    detect(code) { // 检测异常信息
      const riskList = []
      return new Promise((resolve, reject) => {
        this.$store.dispatch('loadStockData', code).then(stock => {
          const duration = 90
          if (stock.getRecentRestrictCount(duration) > 0) {
            riskList.push({
              type: 'warning',
              message: `最近前后${ duration }日存在解禁相关信息`
            })
          }
          resolve(riskList)
        }).catch(_ => {
          reject(_)
        })
      })
    }
  }
}
</script>
