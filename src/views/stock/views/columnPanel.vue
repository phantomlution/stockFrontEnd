<template>
  <el-drawer :title="column.title" size="35%" custom-class="lr-column-drawer" :visible.sync="drawerVisible" v-if="column">
    <div style="padding-right: 16px">
      <el-timeline>
        <el-timeline-item :timestamp="item.date" placement="top" :key="itemIndex" v-for="(item, itemIndex) of column.eventList">
          <el-card class="lr-column-card" :key="eventIndex" v-for="(event, eventIndex) of item.eventList">
            <h4>{{ event.event }}</h4>
            <p>{{ event.time }}</p>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </div>
  </el-drawer>
</template>

<script>
import { deepClone } from '@/utils'

export default {
  data() {
    return {
      drawerVisible: false,
      column: null,
    }
  },
  mounted() {
    this.$bus.$on('openGlobalColumn', column => {
      let local_column = deepClone(column)
      if (local_column.eventList) {
        local_column.eventList.reverse()
      }
      this.column = local_column
      this.open()
    })
  },
  methods: {
    open() {
      this.drawerVisible = true
    }
  }
}
</script>

<style lang="scss">
.lr-column-card{
  .el-card__body{
    padding: 16px 16px 8px 16px;
    h4{
      margin: 0;
    }
    & > p{
      margin: 0;
      margin-top: 12px;
    }
  }

  & + .lr-column-card{
    margin-top: 8px;
  }
}

.lr-column-drawer{
  .el-drawer__body{
    overflow: auto;
  }
}
</style>
