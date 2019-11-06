<template>
  <div>
    <el-radio-group v-model="currentTab" style="width: 100%;text-align: center;margin-bottom: 16px">
      <el-radio-button label="marketTheme">主题筛选器</el-radio-button>
    </el-radio-group>
    <div>
      <div v-if="currentTab === 'marketTheme'">
        <market-theme />
      </div>
    </div>
  </div>
</template>

<script>
import marketTheme from './marketTheme.vue'

export default {
  components: {
    marketTheme,
  },
  data() {
    return {
      currentTab: ''
    }
  }
}
</script>
