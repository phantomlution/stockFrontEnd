<template>
  <div>
    <div style="display: flex;margin-bottom: 16px;">
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

export default {
  components: {
    eventCalendar,
  }
}
</script>
