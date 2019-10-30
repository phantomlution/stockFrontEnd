<template>
  <div>
    <el-radio-group v-model="currentTab" style="width: 100%;text-align: center;margin-bottom: 16px">
      <el-radio-button label="解禁分布">解禁分布</el-radio-button>
    </el-radio-group>

    <div>
      <div v-if="currentTab === '解禁分布'">
        <lr-restrict-sell />
      </div>
    </div>
  </div>
</template>

<script>
import LrRestrictSell from './restrictSell.vue'

export default {
  components: {
    LrRestrictSell
  },
  data() {
    return {
      currentTab: '解禁分布'
    }
  }
}
</script>
