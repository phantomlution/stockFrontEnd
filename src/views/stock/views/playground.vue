<template>
  <div>
    <el-button type="primary" @click.stop="analyze">开始分析</el-button>
    <lr-box style="margin-top: 8px">
      <el-table :data="dataList">
        <el-table-column label="code" prop="code"></el-table-column>
        <el-table-column label="name" prop="name"></el-table-column>
        <el-table-column label="date" prop="date"></el-table-column>
      </el-table>
    </lr-box>
  </div>
</template>

<script>
import stockUtils from '@/utils/stockUtils'

export default {
  data() {
    return {
      dataList: []
    }
  },
  methods: {
    analyze() {
      let result = []
      for (let stock of this.$store.state.data.stockMap.values()) {
        for(let i=stock.rawData.length - 1; i > 0; i--) {
          let diff = stock.rawData[i].high - stock.rawData[i].low
          if (diff * 100 / stock.rawData[i - 1].close >= 11) {
            let timestamp = stock.rawData[i].timestamp
            result.push({
              code: stock.code,
              name: stock.name,
              timestamp,
              date: stockUtils.dateFormat(timestamp)
            })
            break
          }
        }
      }
      result.sort((former, later) => {
        return later.timestamp - former.timestamp
      })

      result = result.filter(item => {
        return item.code.indexOf('SZ300') === -1
      })

      this.dataList = result
      console.log(result)
    }
  }
}
</script>
