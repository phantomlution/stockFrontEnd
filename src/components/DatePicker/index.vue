<template>
  <div style="display: inline-block">
    <el-date-picker v-model="date" style="width: 160px" @change="dateChanged"/>
    <el-button type="primary" @click.stop="toLast">上一天</el-button>
    <el-button type="primary" @click.stop="toNext">下一天</el-button>
  </div>
</template>

<script>
import moment from 'moment'

const props = {
  value: {
    type: [String, Date],
    required: true
  }
}

export default {
  name: 'LrDatePicker',
  props,
  data() {
    return {
      date: this.value
    }
  },
  watch: {
    value(val) {
      this.date = val
    },
    date(val) {
      this.$emit('input', val)
      this.dateChanged(val)
    }
  },
  methods: {
    dateChanged(val) {
      this.$emit('change', val)
    },
    toLast() {
      this.addDate(-1)
    },
    toNext() {
      this.addDate(1)
    },
    addDate(diff) {
      if (this.date) {
        this.date = moment(this.date).add('days', diff).toDate()
      }
    }
  }
}
</script>
