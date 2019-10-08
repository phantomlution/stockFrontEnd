<template>
  <div>
    <el-radio-group v-model="currentTab" style="width: 100%;text-align: center;margin-bottom: 16px">
      <el-radio-button label="elonMusk">Elon Musk</el-radio-button>
      <el-radio-button label="中共政治局会议">中共政治局会议</el-radio-button>
    </el-radio-group>

    <div v-if="currentTab === 'elonMusk'">
      <elon-musk />
    </div>
    <div v-if="currentTab === '中共政治局会议'">
      <lr-link-page src="http://www.12371.cn/special/zzjhy/" />
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
      currentTab: '中共政治局会议'
    }
  }
}
</script>
