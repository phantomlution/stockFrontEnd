<template>
  <span :style="colorStyle">
    <slot name="prepend" />
    <template v-if="percentage.length === 0">
      -
    </template>
    <template v-else>
      {{ percentage }}%
    </template>
    <span></span>
    <slot name="append" />
  </span>
</template>

<script>
const props = {
  percentage: {
    type: String,
    default: ''
  }
}

export default {
  props,
  computed: {
    colorStyle() {
      if(this.percentage.length === 0) {
        return {
          color: ''
        }
      }
      let percent = Number(this.percentage)
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
