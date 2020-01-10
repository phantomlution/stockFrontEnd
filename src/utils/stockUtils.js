import lodash from 'lodash'
import moment from 'moment'
import { apiMap } from '@/api'
import { http } from '@/utils/http'

const MIN_CONTINUOUS_TRADE_DAYS = 22

const TRADE_COUNT_ONE_YEAR = 210 // 每年的交易日数量

export default class StockUtils {

  static hasEverSuspend(dataList, threshold = MIN_CONTINUOUS_TRADE_DAYS) { // 判断是否有比较长的交易日无法交易（判断停牌等）
    // 尝试一下最大考虑1年的数据
    dataList = lodash.takeRight(dataList, TRADE_COUNT_ONE_YEAR)
    if (dataList.length > 1) {
      for(let i=0; i<dataList.length -1; i++) {
        const diff = this.getTradeDaysBetweenTimeRage(dataList[i], dataList[i+1])
        if (diff > threshold) {
          return true
        }
      }
    }
    return false
  }

  static dateFormat(timestamp) {
    if (!timestamp) {
      return ''
    }
    return moment(timestamp).format('YYYY-MM-DD')
  }

  static getTradeDaysBetweenTimeRage(start, end) {
    const oneDayMilliSeconds = 24 * 60 * 60 * 1000
    let result = 0
    while(start + oneDayMilliSeconds <= end) {
      start += oneDayMilliSeconds
      if (moment(start).day() === 0 || moment(start).day() === 6) { // 周末不计入交易日
        continue
      }
      result += 1
    }
    return result
  }

}
