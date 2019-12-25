<template>
  <div>
    <div>
      <div>财经大事件</div>
      <div v-for="item of eventList" :key="item.key">
        <item :item="item" />
      </div>
    </div>
    <div>
      <div>财经数据</div>
      <div v-for="item of dataList" :key="item.key">
        <item :item="item" />
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
  new FilterRule('零售销售', ['德国']),
  new FilterRule('批发库存月率', ['美国']),
  new FilterRule('BBA房屋购买', ['英国']),
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
        if (item.type === 'event') {
          eventList.push(item)
        } else if(item.type === 'data') {
          if (item.name.indexOf('库存变动(万桶)') !== -1) {
//            debugger
          }
          if (item.name.indexOf('中国') !== -1) {
            dataList.push(item)
          } else if (item.importantLevel === '') {
            ignoredDataList.push(item)
          } else if (this.matchRule(item.name, ignoredDataRegexList)) {
            console.log(item)
            ignoredDataList.push(item)
          } else {
            dataList.push(item)
          }
        }
      })

      this.dataList = dataList
      this.ignoredDataList = ignoredDataList
      this.eventList = eventList
      this.ignoredEventList = ignoredEventList
    }
  }
}
</script>
