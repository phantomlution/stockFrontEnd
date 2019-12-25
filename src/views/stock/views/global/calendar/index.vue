<template>
  <div>
    <el-button @click.stop="loadCalendar">test</el-button>

    <el-timeline>
      <el-timeline-item :timestamp="item.date" placement="top" v-for="item of eventList" :key="item.date">
        <item-list :list="item.list"></item-list>
      </el-timeline-item>
    </el-timeline>
  </div>
</template>

<script>
import itemList from './itemList.vue'

export default {
  components: {
    itemList
  },
  data() {
    return {
      eventList: []
    }
  },
  mounted() {
    this.loadCalendar()
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
      Promise.all(this.getDateList().map(date => this.getEventCalendar(date))).then(_ => {
        this.eventList = _
      }).catch(_ => {
        console.error(_)
      })
    }

  }
}
</script>
