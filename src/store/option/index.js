/**
 * Created by yixiaoxiao on 2019/12/24.
 *
 * 期权相关
 */
import { getRecentDeliveryDate, getDeliveryDate } from './utils'
import { object2List } from '@/utils'
import lodash from 'lodash'


// etf 期权列表,(周日 dayOfWeek：7)
const etfOptionList = [
  {
    name: '上证50ETF',
    target: {
      name: '50ETF基金',
      code: 'SH510050'
    },
    delivery: {
      dayOfWeek: 3, // 周三成交
      dayOfWeekOrder: 4 // 第几个周三
    }
  },
  {
    name: '沪.300ETF',
    target: {
      name: '华泰柏瑞沪深300ETF',
      code: 'SH510300'
    },
    delivery: {
      dayOfWeek: 3,
      dayOfWeekOrder: 4
    }
  },
  {
    name: '深.300ETF',
    target: {
      name: '嘉实沪深300ETF',
      code: 'SZ159919'
    },
    delivery: {
      dayOfWeek: 3,
      dayOfWeekOrder: 4
    }
  }
]



export default {
  actions: {
    getEtfOptionNextDeliveryDate() { // 获取下一个交割日
      const deliveryItemList = etfOptionList.map(item => {
        return {
          ...item,
          deliveryDate: getRecentDeliveryDate(item.delivery)
        }
      })
      return object2List(lodash.groupBy(deliveryItemList, (item => item.deliveryDate)))
    },
    getEftOptionDeliveryDate(context, startMonth) { // 获取指定月份的交割日期
      const deliveryItemList = etfOptionList.map(item => {
        return {
          ...item,
          deliveryDate: getDeliveryDate(item.delivery, startMonth)
        }
      })
      return object2List(lodash.groupBy(deliveryItemList, (item => item.deliveryDate)))
    }
  }
}
