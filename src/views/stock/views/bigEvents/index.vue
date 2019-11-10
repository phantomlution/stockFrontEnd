<template>
  <div>
    <div style="display: flex">
      <div style="flex: 1">
        <ongoing />
      </div>
      <div>
        <el-link type="danger" href="https://rl.fx678.com/Index_week.html" target="_blank">本周-财经周历</el-link>
      </div>
    </div>
    <div>
      <eventCalendar />
    </div>
  </div>
</template>

<script>
import eventCalendar from './eventCalendar.vue'
import ongoing from './ongoing.vue'

export default {
  components: {
    eventCalendar,
    ongoing
  }
}
</script>
