<template>
  <div>
    <ongoing />
    <eventCalendar />
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
