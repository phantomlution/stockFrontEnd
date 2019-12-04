<template>
  <div class="lr-emotion-tracker" v-if="displayLabel">
    <span style="font-weight: bold">情绪点:&nbsp;</span>
    <div v-if="hasGoldRisk" style="display: inline-block">
      <span>
        <span style="color: red">黄金概念</span>
        <span>(涨幅第<span style="color: red">{{ riskModel.gold.index }}</span>位,<lr-number-tag :amount="riskModel.gold.percent" />)</span>
      </span>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tracker: null,
      riskModel: {
        gold: null
      },
    }
  },
  beforeDestroy() {
    this.stopTracker()
  },
  computed: {
    hasGoldRisk() {
      return !!this.riskModel.gold
    },
    displayLabel() {
      return this.hasGoldRisk
    }
  },
  mounted() {
    this.startTracker()
  },
  methods: {
    loadData() {
      this.$store.dispatch('getConceptBlock').then(itemList => {
        const goldItemIndex = itemList.findIndex(item => item.name === '黄金概念')
        if (goldItemIndex !== -1 && goldItemIndex < 3) {
          const goldItem = itemList.find(item => item.name === '黄金概念')
          if (goldItem.percent >= 1) {
            this.riskModel.gold = {
              index: goldItemIndex + 1,
              percent: goldItem.percent
            }
            return
          }
        }
        this.riskModel.gold = null
      }).catch(_ => {
        console.error(_)
      })
    },
    startTracker() {
      this.stopTracker()
      this.loadData()
      if (new Date().getHours() >= 15) {
        return
      }
      this.tracker = setInterval(_ => {
        this.loadData()
      }, 60 * 1000)
    },
    stopTracker() {
      if (this.tracker) {
        clearInterval(this.tracker)
      }
      this.tracker = null
    }
  }
}
</script>

<style lang="scss">
.lr-emotion-tracker{
  font-size: 14px;
  height: 28px;
  line-height: 28px;
}
</style>
