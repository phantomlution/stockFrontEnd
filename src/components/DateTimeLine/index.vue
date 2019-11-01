<template>
  <div v-if="hasInit" class="lr-date-time-line">
    <el-slider :value="value" :disabled="true" :show-tooltip="false" :marks="marks" range show-stops :max="max"></el-slider>
  </div>
</template>

<script>
/**
 * 可视化日期区间
 */
import lodash from 'lodash'

const props = {
  dateList: {
    type: Array,
    required: true
  }
}
export default {
  name: 'LrDateTimeLine',
  props,
  data() {
    return {
      max: 0,
      value: [],
      hasInit: false,
      marks: null
    }
  },
  mounted() {
    this.divideTimeList(this.dateList)
  },
  methods: {
    divideTimeList(dateList) {
      const parsedDateList = dateList.map(item => {
        return {
          timestamp: this.$moment(item.date).toDate().getTime(),
          dateString: item.date
        }
      })

      const current = new Date().getTime()

      // 拆分日期
      let oldDateList = parsedDateList.filter(item => item.timestamp <= current)
      let newDateList = parsedDateList.filter(item => item.timestamp > current)


      // 插入起始点
      const firstOldDate = oldDateList.length === 0 ? new Date() : oldDateList[0].dateString
      const appendFirstDate = this.$moment(firstOldDate).add('days', -90)
      oldDateList.unshift({
        timestamp: appendFirstDate.toDate().getTime(),
        dateString: appendFirstDate.format('YYYY-MM-DD')
      })

      // 要素过多，只展示最近的几个数据点
      oldDateList = lodash.takeRight(oldDateList, 3)
      newDateList = lodash.take(newDateList, 3)

      const fullDateList = []
      Array.prototype.push.apply(fullDateList, oldDateList)
      Array.prototype.push.apply(fullDateList, newDateList)

      // 每个日期占用一个刻度
      this.max = fullDateList.length - 1
      const restrict_finished = (newDateList.length === 0)
      let displayString = ''
      if (!restrict_finished) {
        // 距离上一次的天数
        let lastDuration = -1
        if (oldDateList.length > 0) {
          lastDuration = this.$moment().diff(this.$moment(oldDateList[oldDateList.length - 1].dateString), 'days')
        }
        // 距离下一次的天数
        let nextDuration = -1
        if (newDateList.length > 0) {
          nextDuration = this.$moment(newDateList[0].dateString).diff(this.$moment(), 'days')
        }

        if (lastDuration !== -1) {
          displayString += `Last:<span style="color:red;font-weight: bold">${ lastDuration }</span>天`
        }
        if (nextDuration !== -1) {
          if (displayString.length > 0) {
            displayString += ', '
          }
          displayString += `Next:<span style="color:red;font-weight: bold">${ nextDuration }</span>天`
        }
      }

      // 通过天数确定当前时间在指定区间内的比值
      const startIndex = oldDateList.length - 1
      let ratio = 0
      if (!restrict_finished) {
        ratio = (current - oldDateList[startIndex].timestamp) / (newDateList[0].timestamp - oldDateList[startIndex].timestamp)
      }

      if (ratio > 0.8) { // 优化页面样式
        ratio = 0.8
      }
      const currentOffset =  startIndex + lodash.round(ratio, 2)
      this.value = [0, currentOffset]
      // 生成 marks
      const marks = {}
      fullDateList.forEach((item, itemIndex) => {
        if (itemIndex === 0) {
          return
        }
        marks[itemIndex] = item.dateString
      })

      if (restrict_finished) {
        marks[currentOffset - 0.03] = {
          style: {
            color: 'green'
          },
          label: this.$createElement('div', {
            style: {
              'margin-top': '-44px',
              'text-align': 'center'
            },
            domProps: {
              innerHTML: '已完成'
            },
          })
        }
      } else {
        marks[currentOffset] = {
          style: {
            color: 'rgba(0, 0, 0, 0.65)'
          },
          label: this.$createElement('div', {
            style: {
              'margin-top': '-44px',
              'text-align': 'center'
            },
            domProps: {
              innerHTML: displayString
            },
          })
        }
      }

      this.marks = marks
      this.hasInit = true


    }

  }
}
</script>

<style lang="scss">
.lr-date-time-line{
  height: 74px;
  .el-slider{
    height: inherit;
    overflow: hidden;
    padding: 16px;
  }
  .el-slider__runway.disabled{
    .el-slider__bar{
      background-color: #409EFF !important;
    }
    .el-slider__button{
      border-color: #409EFF !important;
    }
  }


  .el-slider__marks{
    div:last-child{
      width: 164px;
    }
  }
}
</style>
