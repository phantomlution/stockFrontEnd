<template>
  <div>
    <stat :item="item" v-for="(item, itemIndex) of itemList" :key="itemIndex" />
  </div>
</template>

<script>
import stat from './stat.vue'

export default {
  components: {
    stat
  },
  data() {
    return {
      itemList: [
        {
          name: '外资企业',
          code: 'A020F01'
        }
      ]
    }
  }
}
</script>
