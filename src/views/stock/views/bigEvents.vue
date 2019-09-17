<template>
  <lr-box>
    <full-calendar :events="calendarEvents" style="max-width: 100%">
      <template slot="fc-event-card" slot-scope="scope">
        <el-popover popper-class="lr-calendar-popover" trigger="hover" placement="right">
          <template slot="reference">
            <div style="white-space: nowrap;overflow: hidden;text-overflow: ellipsis">
              {{ scope.event.title }}
            </div>
          </template>
          <div>
            <el-card>
              <h4>{{ scope.event.title }}</h4>
              <p>{{ scope.event.raw.time }}</p>
            </el-card>
          </div>
        </el-popover>
      </template>
    </full-calendar>
  </lr-box>
</template>

<script>
import chineseCalendar from '@/data/chineseNationalStatisticsCalendar/data2019.json'
import fullCalendar from '@/components/FullCalendar'

export default {
  components: {
    fullCalendar
  },
  data() {
    return {
      calendarEvents: []
    }
  },
  mounted() {
    const calendarList = []
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
