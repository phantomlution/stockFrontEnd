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
  new FilterRule('库存变动'),
  new FilterRule('企业服务价格指数', ['日本']),
  new FilterRule('当周买进外国', ['日本']),
  new FilterRule('当周外资买进', ['日本']),
  new FilterRule('新屋开工年', ['日本']),
  new FilterRule('当周MBA', ['美国']),
  new FilterRule('失业金', ['美国']),
  new FilterRule('BBA', ['英国']),
  new FilterRule('高盛连锁店销售', ['美国']),
  new FilterRule('红皮书商业零售', ['美国']),
  new FilterRule('季调房价指数', ['美国']),
  new FilterRule('谘商会消费者', ['美国']),
  new FilterRule('房价指数', ['美国']),
  new FilterRule('达拉斯联储', ['美国']),
  new FilterRule('成屋签约销售', ['美国']),
  new FilterRule('当周DOE', ['美国'])

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
          if (this.matchRule(item.name, ignoredDataRegexList)) {
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
