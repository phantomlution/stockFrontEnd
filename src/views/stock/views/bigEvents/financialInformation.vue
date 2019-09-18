<template>
  <lr-box :title="date" style="min-width: 75vw">
    <div style="text-align: center;margin-bottom: 16px;">
      <el-radio-group v-model="currentTab">
        <el-radio-button :label="table.name" v-for="(table, tableIndex) of tableList" :key="tableIndex" />
      </el-radio-group>
    </div>
    <div v-for="(table, tableIndex) of tableList" :key="tableIndex" v-show="currentTab === table.name">
      <el-table :data="table.body" max-height="250px" :row-class-name="rowClassName" :default-sort="{ prop: '重要性', order: 'descending' }">
        <el-table-column :label="header.label" :prop="header.prop" :sortable="header.sortable" v-for="(header, headerIndex) of table.header" :key="headerIndex" />
      </el-table>
    </div>
  </lr-box>
</template>

<script>
const props = {
  date: {
    type: String,
    default: ''
  }
}

export default {
  props,
  data() {
    return {
      currentTab: '',
      tableList: []
    }
  },
  mounted() {
    this.loadInformation()
  },
  methods: {
    rowClassName({ row, rowIndex }) {
      if (row['重要性'] === '3') {
        return 'lr-row-important'
      }
      return ''
    },
    loadInformation() {
      if (!this.date) {
        return
      }
      const date = this.date.replace(/-/g, '')
      this.$http.get(`/api/financial/information`, {
        date
      }).then(result => {
        // 生成表格数据
        const tableList = []
        result.data.forEach(tableItem => {
          const tableModel = {
            name: tableItem.name,
            header: tableItem.data[0].map(item => {
              return {
                label: item,
                prop: item,
                sortable: item === '重要性'
              }
            }),
            body: tableItem.data.filter((item, itemIndex) => itemIndex > 0).map(item => {
              const model = {}
              item.forEach((value, valueIndex) => {
                const columnName = tableItem.data[0][valueIndex]
                model[columnName] = value
              })
              return model
            })
          }

          tableList.push(tableModel)

          // 调整下顺序
          const eventItemIndex = tableList.findIndex(item => item.name === '财经大事件')
          if (eventItemIndex !== -1) {
            tableList.unshift(tableList.splice(eventItemIndex, 1)[0])
          }

          this.currentTab = tableList[0].name
        })
        console.log(tableList)
        this.tableList = tableList
      }).catch(_ => {
        console.error(_)
      })
    }
  }
}

</script>

<style lang="scss">
.lr-row-important{
  color: #ce1b02;
}
</style>
