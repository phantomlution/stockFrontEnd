<template>
  <lr-motto :useCollapse="true">
    <div>
      <div class="lr-hint__item" v-for="(item, itemIndex) of displayItemList" :key="itemIndex" v-html="item.html"></div>
      <!--<span>12.15号关税，12.16解禁潮走向</span>-->
      <!--<span>不仅要对<span style="color: red;font-weight: bold">风险</span>敏感，也要对<span style="color: red;font-weight: bold">收益</span>敏感</span>-->
    </div>
  </lr-motto>
</template>

<script>
export default {
  data() {
    return {
      displayItemList: []
    }
  },
  mounted() {
    this.getHintList()
  },
  methods: {
    getHintList() { // 获取所有提醒
      Promise.all([
        this.getOptionDelivery(), // 期权交割日期
        this.getRecentSuspendTradeDateList(), // 最近休市日期
      ]).then(labelList => {
        const displayItemList = []

        labelList.forEach(item => {
          displayItemList.push.apply(displayItemList, item)
        })

        this.displayItemList = displayItemList
      }).catch(_ => {
        console.error(_)
      })
    },
    getOptionDelivery() {
      return new Promise((resolve, reject) => {
        this.$store.dispatch('getEtfOptionNextDeliveryDate').then(optionDeliveryDateList => {
          const displayItemList = []
          optionDeliveryDateList.forEach(item => {
            const title = item.value.map(valueItem => valueItem.name).join(", ")
            displayItemList.push({
              html: `${ item.key } 交割：${ title }`
            })
          })
          resolve(displayItemList)
        }).catch(_ => {
          reject(_)
        })
      })
    },
    getRecentSuspendTradeDateList() { // 提取未来一个月内休市日期
      return new Promise((resolve, reject) => {
        this.$store.dispatch('getSuspendTradeDateList').then(dateList => {
          const today = this.$moment().format('YYYY-MM-DD')

          const startDate = this.$moment(today)
          const endDate = this.$moment(today).add(30, 'days')

          const displayItemList = []

          dateList.forEach(dateItem => {
            if (this.$moment(dateItem.start).isBetween(startDate, endDate) || this.$moment(dateItem.end).isBetween(startDate, endDate)) {
              let dateString = dateItem.start
              if (dateItem.end !== dateItem.start) {
                dateString += (' 至 ' + dateItem.end)
              }

              displayItemList.push({
                html: `${ dateString }: ${ dateItem.type}休市${ dateItem.desc ? `(${dateItem.desc})`: '' }`
              })
            }
          })
          resolve(displayItemList)
        }).catch(_ => {
          reject(_)
        })
      })
    }
  }
}
</script>

<style lang="scss">
.lr-hint__item{
  font-size: 14px;
  & + .lr-hint__item {
    margin-top: 8px
  }
}
</style>
