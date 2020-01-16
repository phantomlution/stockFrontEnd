<template>
  <lr-link-page :src="`http://quote.eastmoney.com/${stockCode}.html`" />
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
    stockCode() {
      const code = this.code
      if (code.indexOf('BK') !== -1) {
        return `web/${ code.substring(3) }1`
      }
      return code
    }
  }
}
</script>
