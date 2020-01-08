<template>
  <el-popover width="540">
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
      <el-button >风险项</el-button>
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
  computed: {
    stockPoolList() {
      return this.$store.getters.stockPoolList
    }
  },
  mounted() {
    this.detectRisk()
  },
  methods: {
    detectRisk() {
      const riskList = []

      this.stockPoolList.forEach(stockPoolItem => {
        const duration = 90
        this.getRecentRestrictSellList(stockPoolItem.base, duration).forEach(item => {
          riskList.push({
            code: stockPoolItem.code,
            name: stockPoolItem.name,
            risk: {
              type: 'warning',
              message: `${ item.date }(${ this.$moment(item.date).fromNow() })：${ item.desc }`
            }
          })
        })
      })
      this.riskList = riskList
    },
    getRecentRestrictSellList(base, days) { // 近期（前后）发生解禁的数量
      const restrictSellList = base.restrict_sell_list || []
      const today = this.$moment()

      return restrictSellList.filter(item => {
        let diff = today.diff(this.$moment(item.date), 'days')
        return Math.abs(diff) <= days
      })
    }
  }
}
</script>
