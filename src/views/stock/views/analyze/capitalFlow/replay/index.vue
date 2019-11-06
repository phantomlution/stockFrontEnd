<template>
  <div>
    <el-form style="margin-bottom: 16px">
      <el-form-item label="查询日期">
        <el-date-picker v-model="date" type="date" placeholder="选择日期"></el-date-picker>
      </el-form-item>
    </el-form>
    <hot-money :date="dateString" style="margin-top: 16px"/>
  </div>
</template>

<script>
import hotMoney from './hotMoney.vue'

export default {
  components: {
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
