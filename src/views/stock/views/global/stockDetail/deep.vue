<template>
  <lr-link-page :src="`http://data.eastmoney.com/stockdata/${rawCode}.html`" />
</template>

<script>
const props = {
  code: {
    type: String,
    required: true
  }
}

export default {
  props,
  computed: {
    rawCode() {
      return this.code.substring(2)
    }
  }
}

</script>
