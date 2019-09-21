<template>
  <div style="padding: 0 16px;">
    <el-form style="margin-bottom: 16px">
      <el-form-item label="查询日期">
        <el-date-picker v-model="date" type="date" placeholder="选择日期"></el-date-picker>
      </el-form-item>
    </el-form>
    <capital-flow :date="dateString" />
    <hot-money :date="dateString" style="margin-top: 16px"/>
  </div>
</template>

<script>
import capitalFlow from './capitalFlow.vue'
import hotMoney from './hotMoney.vue'

export default {
  components: {
    capitalFlow,
    hotMoney
  },
  data() {
    return {
      date: this.$moment().toDate()
    }
  },
  computed: {
    dateString() {
      return this.$moment(this.date).format('YYYY-MM-DD')
    }
  }
}
</script>
