/**
 * 市场日历
 *
 * 用于记录上海证券交易所以及港股通的休市安排
 */

const type_ggt = '港股通'
const type_sse = '上交所'

import { Message } from 'element-ui'
import { $moment } from '@/utils'

function SuspendItem(org, date, info = '',) {
  if ([type_ggt, type_sse].indexOf(org) === -1) {
    Message.error('交易所错误')
  }
  if ($moment(date).format('YYYY-MM-DD') !== date) {
    Message.error('休市日期错误')
  }

  return {
    date,
    title: `[${ org }休市]${info ? ' ' : ''}${info}`,
  }
}

const getSuspendRange = function(org, startDate, endDate, info='') {
  if ($moment(endDate).toDate().getTime() < $moment(startDate).toDate().getTime()) {
    Message('休市结束日期小于开始日期')
  }
  const dateList = []
  for(let i=0; i< 365; i++) {
    const currentDate = $moment(startDate).add(i, 'days').format('YYYY-MM-DD')
    dateList.push(new SuspendItem(org, currentDate, info))
    if (currentDate === endDate) {
      break
    }
  }
  return dateList
}

const suspendDateMap = {
  '2019': [
    new SuspendItem(type_ggt, '2019-12-24', '下午'),
    new SuspendItem(type_ggt, '2019-12-25'),
    new SuspendItem(type_ggt, '2019-12-26'),
    new SuspendItem(type_ggt, '2019-12-31', '下午')
  ],
  '2020': [
    // 港股通
    new SuspendItem(type_ggt, '2020-01-01'),
    ...getSuspendRange(type_ggt, '2020-01-22', '2020-01-30', '春节'),
    ...getSuspendRange(type_ggt, '2020-04-02', '2020-04-06', '清明节'),
    ...getSuspendRange(type_ggt, '2020-04-10', '2020-04-13', '香港耶稣受难节、复活节'),
    ...getSuspendRange(type_ggt, '2020-04-28', '2020-05-05', '香港佛诞日、劳动节'),
    ...getSuspendRange(type_ggt, '2020-06-23', '2020-06-27', '端午节'),
    new SuspendItem(type_ggt, '2020-07-01', '香港特别行政区成立纪念日'),
    ...getSuspendRange(type_ggt, '2020-09-29', '2020-10-08', '国庆节、中秋节'),
    new SuspendItem(type_ggt, '2020-10-26', '香港重阳节翌日'),
    new SuspendItem(type_ggt, '2020-12-24', '下午,香港圣诞节'),
    ...getSuspendRange(type_ggt, '2020-12-25', '2020-12-27', '香港圣诞节'),
    // 上交所
    new SuspendItem(type_sse, '2020-01-01', '元旦'),
    ...getSuspendRange(type_sse, '2020-01-24', '2020-01-30', '春节'),
    ...getSuspendRange(type_sse, '2020-04-04', '2020-04-06', '清明节'),
    ...getSuspendRange(type_sse, '2020-05-01', '2020-05-05', '劳动节'),
    ...getSuspendRange(type_sse, '2020-06-25', '2020-06-27', '端午节'),
    ...getSuspendRange(type_sse, '2020-10-01', '2020-10-08', '国庆节、中秋节')
  ]
}

// 按照部分规则进行校验
Object.keys(suspendDateMap).forEach(suspendYear => {
  const suspendItemList = suspendDateMap[suspendYear]
  suspendItemList.forEach(item => {
    if (item.date.substring(0, 4) !== suspendYear) {
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

export default {
  actions: {
    getSuspendTradeDateList(context) {
      return suspendTradeDateList
    }
  }

}
