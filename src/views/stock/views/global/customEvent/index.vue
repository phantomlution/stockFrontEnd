<template>
  <div>
    <event-dialog />
    <event-item-dialog />
  </div>
</template>

<script>
import eventDialog from './eventDialog.vue'
import eventItemDialog from './item/dialog.vue'

export default {
  components: {
    eventDialog,
    eventItemDialog
  }
}
</script>
