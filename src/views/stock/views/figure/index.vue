<template>
  <div>
    <el-radio-group v-model="currentTab" style="width: 100%;text-align: center;margin-bottom: 16px">
      <el-radio-button label="elonMusk">Elon Musk</el-radio-button>
    </el-radio-group>

    <div v-if="currentTab === 'elonMusk'">
      <elon-musk />
    </div>
  </div>
</template>

<script>
import elonMusk from './elonMusk.vue'

export default {
  components: {
    elonMusk
  },
  data() {
    return {
      currentTab: 'elonMusk'
    }
  }
}
</script>
