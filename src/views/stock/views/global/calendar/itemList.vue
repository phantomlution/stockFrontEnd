<template>
  <div>
    <div class="lr-financial-calendar-block" v-if="eventList.length > 0">
      <div>
        <div class="lr-financial-calendar-block-label">财经大事件</div>
      </div>
      <div>
        <item :item="item" v-for="item of eventList" :key="item.key"/>
      </div>
    </div>
    <div class="lr-financial-calendar-block" v-if="dataList.length > 0">
      <div class="lr-financial-calendar-block-label">财经数据</div>
      <div>
        <item :item="item" v-for="item of dataList" :key="item.key"/>
      </div>
    </div>
  </div>
</template>

<script>
import item from './item.vue'

const FilterRule = function(keyword, countryList = []) {
  let countryRegExp = ''
  if (countryList.length > 0) {
    countryRegExp = `(${ countryList.map(item => `(${ item })`).join('|') })`
    countryRegExp = `^${countryRegExp}.*`
  }

  return new RegExp(`${ countryRegExp }${keyword}`)
}

const ignoredDataRegexList = [ // 忽略数据
  new FilterRule('库存变动', ['美国']),
  new FilterRule('失业金人数', ['美国']),
  new FilterRule('钻井总数', ['美国']),
  new FilterRule('零售', ['德国', '英国']),
  new FilterRule('批发库存月率', ['美国']),
  new FilterRule('BBA房屋购买', ['英国']),
  new FilterRule('贸易帐', ['意大利']),
  new FilterRule('CPI', ['欧元']),
  new FilterRule('新屋', ['美国']),
  new FilterRule('营建', ['美国']),
  new FilterRule('信心', ['美国']),
  new FilterRule('工业', ['美国']),
  new FilterRule('职位', ['美国'])
]

const props = {
  list: {
    type: Array,
    required: true
  }
}
export default {
  props,
  components: {
    item
  },
  data() {
    return {
      dataList: [],
      ignoredDataList: [],
      eventList: [],
      ignoredEventList: []
    }
  },
  watch: {
    list() {
      this.updateEventList()
    }
  },
  mounted() {
    this.updateEventList()
  },
  methods: {
    matchRule(str, ruleList) {
      for(let i=0; i<ruleList.length; i++) {
        if (ruleList[i].test(str)) {
          return true
        }
      }
      return false
    },
    updateEventList() { // 处理数据，忽略部分数据以减小数据量
      const dataList = []
      const ignoredDataList = []
      const eventList = []
      const ignoredEventList = []
      this.list.forEach(item => {
        if (item.name.indexOf('GDP') !== -1) {
          item.notify = true
        }
        if (item.type === 'event') {
          eventList.push(item)
        } else if(item.type === 'data') {
          if (item.name.indexOf('中国') !== -1) {
            dataList.push(item)
          } else if (item.importantLevel === '') {
            ignoredDataList.push(item)
          } else if (this.matchRule(item.name, ignoredDataRegexList)) {
            ignoredDataList.push(item)
          } else {
            dataList.push(item)
          }
        }
      })

      if (eventList.length === 0) {
        eventList.push({
          name: '暂无数据',
          time: '待定'
        })
      }
      this.dataList = dataList
      this.ignoredDataList = ignoredDataList
      this.eventList = eventList
      this.ignoredEventList = ignoredEventList
    }
  }
}
</script>

<style lang="scss">
.lr-financial-calendar-block{
  & + .lr-financial-calendar-block{
    margin-top: 16px;
  }
}

.lr-financial-calendar-block-label{
  color: #1f2f3d;
  margin-bottom: 8px;
}
</style>
