<template>
  <div style="display: inline-block">
    <el-date-picker v-model="date" placeholder="请选择日期" :picker-options="pickerOptions" style="width: 160px" @change="dateChanged"/>
    <span>
      <el-button type="primary" @click.stop="toLast">前一日</el-button>
      <el-button type="primary" @click.stop="toNext">后一日</el-button>
    </span>
  </div>
</template>

<script>
const props = {
  value: {
    type: Date,
    required: false
  },
  pattern: {
    type: String,
    default: ''
  }
}

export default {
  name: 'LrDatePicker',
  props,
  data() {
    return {
      date: this.value,
      pickerOptions: {
        disabledDate: date => {
          if (this.isStock) {
            return this.tradeDateList.indexOf(this.$moment(date).format('YYYY-MM-DD')) === -1
          } else {
            return false
          }
        }
      }
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
  computed: {
    isStock() {
      return this.pattern === 'stock'
    },
    tradeDateList() {
      return this.$store.state.data.tradeDateList
    }
  },
  methods: {
    dateChanged(val) {
      this.$emit('change', val)
    },
    getCurrent() {
      return this.date ? this.$moment(this.date).format('YYYY-MM-DD') : this.$moment().format('YYYY-MM-DD')
    },
    toLast() {
      this.addDate(-1)
    },
    toNext() {
      this.addDate(1)
    },
    addDate(diff) {
      const current = this.getCurrent()

      let nextDate = null

      if (this.isStock) {
        let dateIndex = this.tradeDateList.findIndex(item => item === current)

        // 非交易日, 尝试回溯到之前的最后一个交易日
        if (dateIndex === -1) {
          const nextIndex = this.tradeDateList.findIndex(item => item >= current)
          dateIndex = nextIndex - 1
        }

        if (dateIndex >= 0) {
          const targetIndex = dateIndex + diff
          if (targetIndex >=0 && targetIndex <= this.tradeDateList.length - 1) {
            nextDate = this.$moment(this.tradeDateList[targetIndex])
          }
        }
      }

      if(!nextDate) {
        nextDate = this.$moment(current).add('days', diff)
      }

      this.date = nextDate.toDate()
    }
  }
}
</script>
