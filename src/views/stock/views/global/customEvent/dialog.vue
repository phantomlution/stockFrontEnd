<template>
  <el-dialog :title="title" :visible.sync="visible" :close-on-click-modal="false">
    <custom-event-add ref="add" v-if="visible" @close="closeDialog"/>
  </el-dialog>
</template>

<script>
import customEventAdd from './add.vue'

export default {
  components: {
    customEventAdd
  },
  data() {
    return {
      title: '关联自定义事件',
      visible: false,
    }
  },
  beforeDestroy() {
    this.$bus.$off('openCustomEventDialog')
  },
  mounted() {
    this.$bus.$on('openCustomEventDialog', model => {
      this.visible = true
      this.$nextTick(_ => {
        this.$refs.add.doInit(model)
      })
    })
  },
  methods: {
    closeDialog() {
      this.visible = false
    }
  }
}
</script>
