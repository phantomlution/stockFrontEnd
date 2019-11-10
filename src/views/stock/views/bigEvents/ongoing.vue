<template>
  <div v-if="columnItemList.length > 0" class="lr-event-ongoing">
    <el-form>
      <el-form-item label="进行中">
        <el-link type="danger" @click.stop="showColumnDetail(item.raw)" v-for="(item, itemIndex) of columnItemList" :key="itemIndex">{{ item.title }}</el-link>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import columnList from '@/data/columnList'

export default {
  data() {
    return {
      columnItemList: []
    }
  },
  mounted() {
    this.loadColumnList().then(_ => {
      this.columnItemList = _
    }).catch(_ => {
      console.error(_)
    })
  },
  methods: {
    showColumnDetail(column) { // 展示专栏
      this.$bus.$emit('openGlobalColumn', column)
    },
    loadColumnList() { // 加载未完成的专栏
      return new Promise((resolve, reject) => {
        const result = []
        columnList.filter(column => !column.finish).forEach(column => {
          // 为了让信息出现在日历中，每次未最近几天
          result.push({
            start: this.$moment().format('YYYY-MM-DD'),
            end: this.$moment().format('YYYY-MM-DD'),
            title: `${ column.title }`,
            isImportant: true,
            display: 'column',
            raw: column
          })
        })
        resolve(result)
      })
    }
  }
}
</script>

<style lang="scss">
.lr-event-ongoing{
  margin-bottom: -8px;
}

.lr-event-ongoing .el-link{
  & + .el-link{
    margin-left: 16px;
  }
}
</style>
