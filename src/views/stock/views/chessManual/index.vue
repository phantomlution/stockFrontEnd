<template>
  <div>
    <div style="margin-bottom: 16px">
      <lr-motto>
        所有预测分为：开盘，早盘，午盘，尾盘走势。且要包含买卖点分析。
      </lr-motto>
    </div>
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
