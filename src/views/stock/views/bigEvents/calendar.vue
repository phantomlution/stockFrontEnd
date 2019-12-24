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
            <el-card>
              <h4 :class="{ 'lr-calendar-important': scope.event.isImportant }" >
                {{ scope.event.title }}
              </h4>
              <el-button type="text" v-if="scope.event.source" @click.stop="toSource(scope.event.source)">信息来源</el-button>
            </el-card>
          </div>
        </el-popover>
      </template>
    </full-calendar>
  </lr-box>
</template>

<script>
import customEvent from '@/data/customEvent'
import fullCalendar from '@/components/FullCalendar'

export default {
  components: {
    fullCalendar
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
    toSource(source) {
      window.open(source, '_blank')
    },
    loadData() {
      this.loading = true
      const calendarList = []

      Promise.all([
        this.loadSuspendTradeDateList(),
        this.loadOptionDeliveryDate(),
        this.loadStockPreReleaseNotice(),
        this.loadCentralBankEvent(),
        this.loadCustomEvent(),
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
    loadStockPreReleaseNotice() { // 加载股票预发布信息
      return new Promise((resolve, reject) => {
        this.$http.get(`/api/stock/pool/prerelease/calendar`).then(response => {
          const result = []
          response.forEach(stock => {
            stock.list.forEach(releaseItem => {
              result.push({
                "title": `[股票][${ stock.name}] ${ releaseItem.title }`,
                "start": releaseItem.date,
                "end": releaseItem.date,
                "raw": releaseItem,
                "isImportant": true
              })
            })
          })
          resolve(result)
        }).catch(_ => {
          reject(_)
        })
      })
    },
    loadCustomEvent() { // 加载自定义事件
      return Promise.resolve(customEvent)
    },
    loadSuspendTradeDateList() { // 加载休市日期列表
      return new Promise((resolve, reject) => {
        this.$store.dispatch('getSuspendTradeDateList').then(dateList => {
          const result = []
          dateList.forEach(item => {
            result.push({
              title: `${ item.title }`,
              start: item.date,
              end: item.date,
              isImportant: true
            })
          })
          resolve(result)
        }).catch(_ => {
          reject(_)
        })
      })
    },
    loadOptionDeliveryDate() { // 加载期权交割日期
      return new Promise((resolve, reject) => {
        const currentMonth = this.$moment().format('YYYY-MM')
        const lastMonth = this.$moment(`${ currentMonth }-01`).add(-1, 'months').format('YYYY-MM')
        const nextMonth = this.$moment(`${ currentMonth }-01`).add(1, 'months').format('YYYY-MM')

        Promise.all([
          this.$store.dispatch('getEftOptionDeliveryDate', lastMonth),
          this.$store.dispatch('getEftOptionDeliveryDate', currentMonth),
          this.$store.dispatch('getEftOptionDeliveryDate', nextMonth)
        ]).then(_ => {
          console.log(_)
          const result = []
          _.forEach(deliveryItemList => {
            deliveryItemList.forEach(deliveryItem => {
              const date = deliveryItem.key
              const title = `[期权交割] ${ deliveryItem.value.map(item => item.name).join(', ')}`

              result.push({
                title,
                start: date,
                end: date,
                isImportant: true
              })
            })
          })
          resolve(result)
        }).catch(_ => {
          reject(_)
        })
      })
    },
    loadCentralBankEvent() { // 加载央行会议
      return new Promise((resolve, reject) => {
        this.$http.get(`/api/data/centralBank`).then(response => {
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
