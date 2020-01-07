<template>
  <lr-link-page :src="`http://quote.eastmoney.com/concept/${code}.html?from=classic`" />
</template>

<script>
const props = {
  code: {
    type: String,
    required: true
  }
}
export default {
  props
}
</script>
