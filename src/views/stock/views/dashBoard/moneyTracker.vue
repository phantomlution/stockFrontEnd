<template>
  <div>
    <hot-money :showLabel="true" :showNorthChart="false" :showSouthChart="false" :live="true" style="display: inline-block" />
    <el-popover width="480" popper-class="lr-clear" v-model="dialogVisible">
      <hot-money v-if="dialogVisible" :lightMode="true" :showSouthChart="false" :live="true" :height="200"/>
      <el-button type="text" slot="reference">实时走势</el-button>
    </el-popover>
  </div>
</template>

<script>
import hotMoney from '@/views/stock/views/analyze/capitalFlow/replay/hotMoney'

export default {
  components: {
    hotMoney
  },
  data() {
    return {
      dialogVisible: false
    }
  }
}
</script>
