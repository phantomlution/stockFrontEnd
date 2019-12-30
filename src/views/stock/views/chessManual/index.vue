<template>
  <div>
    <div>
      <!-- 七日数据 -->
      <item-list :autoLoad="true" />
    </div>
    <div>
      <!-- 历史数据 -->
      <item-list :isHistory="true"/>
    </div>
  </div>
</template>

<script>
import itemList from './itemList.vue'

export default {
  components: {
    itemList,
  }
}
</script>
