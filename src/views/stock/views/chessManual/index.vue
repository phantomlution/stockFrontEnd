<template>
  <div>
    <div>
      <stock-live code="SH600242" name="泰永长征" />
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
import stockLive from '@/views/stock/components/realTimeDetail'

export default {
  components: {
    itemList,
    stockLive
  }
}
</script>
