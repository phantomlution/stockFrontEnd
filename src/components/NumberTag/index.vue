<template>
  <span :style="colorStyle">
    <slot name="prepend" />
    <template v-if="amount.length === 0">
      <span>-</span>
    </template>
    <template v-else>
      <span>{{ amount }}{{ unit }}</span>
    </template>
    <slot name="append" />
  </span>
</template>

<script>
const props = {
  amount: {
    type: [String, Number],
    default: ''
  },
  unit: {
    type: String,
    default: '%'
  }
}

export default {
  name: 'LrNumberTag',
  props,
  computed: {
    colorStyle() {
      if(isNaN(this.amount)) {
        return {
          color: 'grey'
        }
      }
      let percent = Number(this.amount)
      if (percent > 0) {
        return {
          color: 'red'
        }
      }else if (percent === 0) {
        return {
          color: 'grey'
        }
      } else {
        return {
          color: 'green'
        }
      }
    }
  }
}
</script>
