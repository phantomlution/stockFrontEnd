<template>
  <lr-box v-loading="loading">
    <full-calendar :events="calendarEvents" style="max-width: 100%">
      <template slot="fc-event-card" slot-scope="scope">
        <el-popover popper-class="lr-calendar-popover" trigger="hover" placement="right">
          <template slot="reference">
            <div style="white-space: nowrap;overflow: hidden;text-overflow: ellipsis">
              <span :class="{ 'lr-calendar-important': scope.event.isImportant }">{{ scope.event.title }}</span>
            </div>
          </template>
          <div>
            <template v-if="scope.event.title === '财经资讯'">
              <financialInformation :date="scope.event.start" />
            </template>
            <template v-else>
              <el-card>
                <h4 :class="{ 'lr-calendar-important': scope.event.isImportant, 'lr-hover': scope.event.display === 'column' }" @click.stop="showColumnDetail(scope.event.raw)">
                  {{ scope.event.title }}
                </h4>
                <el-button type="text" v-if="scope.event.source" @click.stop="toSource(scope.event.source)">信息来源</el-button>
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
import columnList from '@/data/columnList'

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
    showColumnDetail(column) { // 展示专栏
      console.log(column)
      this.$bus.$emit('openGlobalColumn', column)
    },
    toSource(source) {
      window.open(source, '_blank')
    },
    loadData() {
      this.loading = true
      const calendarList = []

      Promise.all([
        this.loadCentralBankEvent(),
        this.loadColumnList(),
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
    loadCentralBankEvent() { // 加载央行会议
      return new Promise((resolve, reject) => {
        this.$http.get(`/api/financial/centralBank`).then(response => {
          const result = response.data.map(item => {
            return {
              start: item.date,
              end: item.date,
              title: `[央行会议] ${ item.bankList.join(',')}`,
              isImportant: item.bankList.indexOf('美联储') !== -1,
              raw: item
            }
          })

          resolve(result)
        }).catch(_ => {
          reject(_)
        })
      })
    },
    loadColumnList() { // 加载未完成的专栏
      return new Promise((resolve, reject) => {
        const result = []
        columnList.filter(column => !column.finish).forEach(column => {
          // 为了让信息出现在日历中，每次未最近几天
          result.push({
            start: this.$moment().add('days', 0).format('YYYY-MM-DD'),
            end: this.$moment().add('days', 0).format('YYYY-MM-DD'),
            title: `[进行中] ${ column.title }`,
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
.lr-calendar-popover{
  padding: 0 !important;
}

.lr-calendar-important{
  color: red;
  font-weight: bold;
}
</style>
