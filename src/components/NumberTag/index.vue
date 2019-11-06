<template>
  <span :style="colorStyle">
    <slot name="prepend" />
    <template v-if="amount.length === 0">
      -
    </template>
    <template v-else>
      {{ amount }}{{ unit }}
    </template>
    <span></span>
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
      if(this.amount.length === 0) {
        return {
          color: ''
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
