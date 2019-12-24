<template>
  <lr-motto>
    <div>
      <span v-for="(item, itemIndex) of displayItemList" :key="itemIndex" v-html="item.html"></span>
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
    this.getDeliveryDate()
  },
  methods: {
    getDeliveryDate() { // 获取交割日期
      Promise.all([
        this.getOptionDelivery()
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
    }
  }
}
</script>
