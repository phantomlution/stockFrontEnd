<!-- 股票质押页面 -->
<template>
  <lr-link-page :src="`http://data.eastmoney.com/gpzy/detail/${rawCode}.html`" />
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
