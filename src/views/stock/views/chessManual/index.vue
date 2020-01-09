<template>
  <div>
    <div style="margin-bottom: 16px">
      <lr-motto>
        前一个交易日结束后，预测第二天的【开盘】，【早盘】；当天中午预测【午盘】，【尾盘】。且要包含买卖点分析。
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
