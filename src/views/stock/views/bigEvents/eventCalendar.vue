<template>
  <lr-box>
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
      calendarEvents: []
    }
  },
  mounted() {
    const calendarList = []

    // 追加资讯
//    for (let i=-2; i<3; i++) {
//      const date = this.$moment().add(i, 'days')
//      const dateString = date.format('YYYY-MM-DD')
//      calendarList.push({
//        title: '财经资讯',
//        start: dateString,
//        end: dateString
//      })
//    }


    // 追加自定义事件
    Array.prototype.push.apply(calendarList, customEvent)

    // 追加国家统计局数据
    chineseCalendar.forEach(item => {
      calendarList.push({
        title: `${ item.eventName }`,
        start: item.date,
        end: item.date,
        raw: item
      })
    })

    this.calendarEvents = calendarList
  },
  methods: {
  }
}
</script>

<style lang="scss">
.lr-calendar-popover{
  padding: 0 !important;
}
</style>
