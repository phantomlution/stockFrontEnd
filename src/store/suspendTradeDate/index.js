/**
 * 市场日历
 *
 * 用于记录上海证券交易所以及港股通的休市安排
 */
import { Message } from 'element-ui'
import { $moment } from '@/utils'
import lodash from 'lodash'

const type_ggt = '港股通'
const type_sse = '上交所'

function SuspendItem({ type, start, end='', desc = ''}) {
  if (end === '') {
    end = start
  }
  if ([type_ggt, type_sse].indexOf(type) === -1) {
    Message.error('交易所错误')
  }
  if ($moment(start).format('YYYY-MM-DD') !== start) {
    Message.error('休市日期错误')
  }
  if ($moment(end).format('YYYY-MM-DD') !== end) {
    Message.error('休市日期错误')
  }

  if ($moment(end).toDate().getTime() < $moment(start).toDate().getTime()) {
    Message('休市结束日期小于开始日期')
  }

  return {
    type,
    start,
    end,
    desc
  }
}

const suspendDateMap = {
  '2019': [
    new SuspendItem({ type: type_ggt, start: '2019-12-24', end: '2019-12-26', desc: '2019-12-24 下午开始休市' }),
    new SuspendItem({ type: type_ggt, start: '2019-12-31', desc: '2019-12-31下午开始休市'}),
  ],
  '2020': [
    // 港股通
    new SuspendItem({ type: type_ggt, start: '2020-01-01' }),
    new SuspendItem({ type: type_ggt, start: '2020-01-22', end: '2020-01-30', desc: '春节' }),
    new SuspendItem({ type: type_ggt, start: '2020-04-02', end:'2020-04-06', desc: '清明节'}),
    new SuspendItem({ type: type_ggt, start: '2020-04-10', end:'2020-04-13', desc: '香港耶稣受难节、复活节'}),
    new SuspendItem({ type: type_ggt, start: '2020-04-28', end:'2020-05-05', desc: '香港佛诞日、劳动节'}),
    new SuspendItem({ type: type_ggt, start: '2020-06-23', end:'2020-06-27', desc: '端午节'}),
    new SuspendItem({ type: type_ggt, start: '2020-07-01', desc: '香港特别行政区成立纪念日'}),
    new SuspendItem({ type: type_ggt, start: '2020-09-29', end:'2020-10-08', desc: '国庆节、中秋节'}),
    new SuspendItem({ type: type_ggt, start: '2020-10-26', desc: '香港重阳节翌日'}),
    new SuspendItem({ type: type_ggt, start: '2020-12-24', desc: '2020-12-24下午开始休市,香港圣诞节'}),
    new SuspendItem({ type: type_ggt, start: '2020-12-25', end:'2020-12-27', desc: '香港圣诞节'}),
    // 上交所
    new SuspendItem({ type: type_sse, start: '2020-01-01', desc: '元旦'}),
    new SuspendItem({ type: type_sse, start: '2020-01-24', end:'2020-01-30', desc: '春节'}),
    new SuspendItem({ type: type_sse, start: '2020-04-04', end:'2020-04-06', desc: '清明节'}),
    new SuspendItem({ type: type_sse, start: '2020-05-01', end:'2020-05-05', desc: '劳动节'}),
    new SuspendItem({ type: type_sse, start: '2020-06-25', end:'2020-06-27', desc: '端午节'}),
    new SuspendItem({ type: type_sse, start: '2020-10-01', end:'2020-10-08', desc: '国庆节、中秋节'})
  ]
}

// 按照部分规则进行校验
Object.keys(suspendDateMap).forEach(suspendYear => {
  const suspendItemList = suspendDateMap[suspendYear]
  suspendItemList.forEach(item => {
    if (item.start.substring(0, 4) !== suspendYear || item.end.substring(0, 4) !== suspendYear) {
      Message.error('休市年份不匹配')
    }
  })

})

const suspendTradeDateList = []
Object.keys(suspendDateMap).forEach(suspendYear => {
  const suspendItemList = suspendDateMap[suspendYear]
  suspendItemList.forEach(item => {
    suspendTradeDateList.push(item)
  })
})

const sortedSuspendTradeDateList = lodash.sortBy(suspendTradeDateList, function(item) { return item.start })

export default {
  actions: {
    getSuspendTradeDateList(context) {
      return sortedSuspendTradeDateList
    }
  }

}
