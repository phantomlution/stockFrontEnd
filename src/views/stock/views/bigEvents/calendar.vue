<template>
  <lr-box v-loading="loading">
    <div style="position: absolute;right: 18px;top: 24px">
      <add-custom-event @change="reload"/>
    </div>
    <full-calendar :calendarEvents="calendarEvents" >
    </full-calendar>
  </lr-box>
</template>

<script>
import fullCalendar from '@/components/FullCalendar'
import addCustomEvent from './addCustomEvent.vue'

export default {
  components: {
    fullCalendar,
    addCustomEvent
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
    reload() {
      this.loadData()
    },
    loadData() {
      this.loading = true

      Promise.all([
        this.loadSuspendTradeDateList(),
        this.loadOptionDeliveryDate(),
        this.loadStockPreReleaseNotice(),
//        this.loadCentralBankEvent(),
        this.loadCustomEvent(),
      ]).then(allEventList => {
        const calendarList = []
        allEventList.forEach(event => {
          event.forEach(item => {
            item.start = this.$moment(item.start + ' 00:00:00').toDate()
            item.end = this.$moment(item.end + " 23:59:59").toDate()
          })

          Array.prototype.push.apply(calendarList, event)
        })
        console.log(calendarList)
        this.calendarEvents = calendarList
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
      return this.$http.get(`/api/event/calendar/`)
    },
    loadSuspendTradeDateList() { // 加载休市日期列表
      return new Promise((resolve, reject) => {
        this.$store.dispatch('getSuspendTradeDateList').then(dateList => {
          const result = []
          dateList.forEach(item => {
            result.push({
              title: `[${ item.type } 休市] ${ item.desc }`,
              start: item.start,
              end: item.end,
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
      this.$message.error('前端未修改, loadCentralBankEvent')
      return Promise.resolve([])
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
.fc-time{
  display: none;
}
</style>
