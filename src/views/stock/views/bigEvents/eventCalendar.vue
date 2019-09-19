<template>
  <lr-box v-loading="loading">
    <full-calendar :events="calendarEvents" style="max-width: 100%">
      <template slot="fc-event-card" slot-scope="scope">
        <el-popover popper-class="lr-calendar-popover" trigger="hover" placement="bottom">
          <template slot="reference">
            <div style="white-space: nowrap;overflow: hidden;text-overflow: ellipsis">
              {{ scope.event.title }}
            </div>
          </template>
          <div>
            <template v-if="scope.event.title === '财经资讯'">
              <financialInformation :date="scope.event.start" />
            </template>
            <template v-else>
              <el-card>
                <h4>{{ scope.event.title }}</h4>
                <p v-if="scope.event.raw">{{ scope.event.raw.time }}</p>
              </el-card>
            </template>
          </div>
        </el-popover>
      </template>
    </full-calendar>
  </lr-box>
</template>

<script>
import chineseCalendar from '@/data/chineseNationalStatisticsCalendar/data2019.json'
import customEvent from '@/data/customEvent'
import fullCalendar from '@/components/FullCalendar'
import moment from 'moment'
import financialInformation from './financialInformation.vue'

export default {
  components: {
    fullCalendar,
    financialInformation
  },
  data() {
    return {
      loading: true,
      calendarEvents: []
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    loadData() {
      this.loading = true
      const calendarList = []

      Promise.all([
        this.loadCentralBankEvent(),
        this.loadCustomEvent(),
        this.loadOtherEvent()
      ]).then(allEventList => {
        allEventList.forEach(event => {
          Array.prototype.push.apply(calendarList, event)
          this.calendarEvents = calendarList
        })
        this.$nextTick(_ => {
          this.loading = false
        })
      }).catch(_ => {
        console.error(_)
        this.loading = false
      })
    },
    loadCustomEvent() { // 加载自定义事件
      return Promise.resolve(customEvent)
    },
    loadOtherEvent() { // 追加国家统计局数据
      const eventList = []
      chineseCalendar.forEach(item => {
        eventList.push({
          title: `${ item.eventName }`,
          start: item.date,
          end: item.date,
          raw: item
        })
      })
      return Promise.resolve(eventList)
    },
    loadCentralBankEvent() {
      return new Promise((resolve, reject) => {
        this.$http.get(`/api/financial/centralBank`).then(response => {
          const result = response.data.map(item => {
            return {
              start: item.date,
              end: item.date,
              title: `[央行会议] ${ item.bankList.join(',')}`
            }
          })

          resolve(result)
        }).catch(_ => {
          reject(_)
        })
      })
    }
  }
}
</script>

<style lang="scss">
.lr-calendar-popover{
  padding: 0 !important;
}
</style>
