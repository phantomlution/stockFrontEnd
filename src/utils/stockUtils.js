import lodash from 'lodash'
import moment from 'moment'
import { apiMap } from '@/api'
import { http } from '@/utils/http'

const MIN_CONTINUOUS_TRADE_DAYS = 22

const TRADE_COUNT_ONE_YEAR = 210 // 每年的交易日数量

export default class StockUtils {

  static getTurnoverRateInDays(data, lastDays) { // 获取指定时间的水流率
    const calculateDataList = lodash.takeRight(data, lastDays)
    const waterList = calculateDataList.map(item => item.turnoverRate).filter(item => item !== null)
    return lodash.round(lodash.mean(waterList), 2)
  }

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

  static getCodeList() {
    return new Promise((resolve, reject) => {
      http.get(apiMap.getCodeList).then(response => {
        const codeNameMap = new Map()
        response.nameList.forEach(item => {
          codeNameMap.set(item.code, item.name)
        })

        let codeList = response.idList.map(item => ({
          value: item.symbol,
          label: codeNameMap.get(item.symbol)
        }))
        resolve({
          codeList: codeList.filter(item => item.label),
          baseList: response.idList
        })
      }).catch(_ => {
        console.log(_)
        reject(_)
      })
    })
  }

  static isMakeShortPoint(yesterday, today) { // 是否当日交易量上升且价格下跌
    return today.diff > yesterday.diff && today.close < yesterday.close
  }

  static isMakeLongPoint(yesterday, today) {
    return today.diff < yesterday.diff && today.close > yesterday.close
  }

}
