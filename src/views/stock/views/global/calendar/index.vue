<template>
  <el-popover v-model="visible">
    <div v-loading="isLoading" class="lr-financial-calendar">
      <el-timeline class="lr-pretty">
        <el-timeline-item :timestamp="item.date" placement="top" v-for="item of eventList" :key="item.date">
          <item-list :list="item.list"></item-list>
        </el-timeline-item>
      </el-timeline>
    </div>
    <el-button circle icon="el-icon-date" slot="reference"></el-button>
  </el-popover>
</template>

<script>
/**
 * 样式模拟 Bilibili 的历史界面
 */

import itemList from './itemList.vue'

export default {
  components: {
    itemList
  },
  data() {
    return {
      eventList: [],
      visible: false,
      isLoading: false
    }
  },
  watch: {
    visible(val) {
      if (val && this.eventList.length === 0) {
        this.loadCalendar()
      }
    }
  },
  methods: {
    getDateList() { // 获取最近7日数据
      const result = []
      for(let i=0; i< 7; i++) {
        result.push(this.$moment().add('days', i).format('YYYY-MM-DD'))
      }
      return result
    },
    getEventCalendar(date) {
      return new Promise((resolve, reject) => {
        this.$http.get(`/api/data/calendar`, { date }).then(_ => {
          resolve({
            date,
            list: _
          })
        }).catch(_ => {
          reject(_)
        })
      })
    },
    loadCalendar() {
      if (this.isLoading) {
        return
      }
      this.isLoading = true

      Promise.all(this.getDateList().map(date => this.getEventCalendar(date))).then(_ => {
        this.eventList = _
        this.isLoading = false
      }).catch(_ => {
        this.isLoading = false
        console.error(_)
      })
    }

  }
}
</script>

<style lang="scss">
.lr-financial-calendar{
  width: 60vw;
  height: 60vh;
  overflow: auto;
  padding: 8px 0;
}

</style>
