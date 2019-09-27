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

  static calculateMarketTrendPercentage(stockMap, days) {
    const result = []
    for(let i=1; i<=days; i++) {
      const startDate = moment().add('days', -1 * days + i).toDate()
      const startDateString = this.dateFormat(startDate.getTime())
      let usedStockCount = 0
      let halfNegativeCount = 0
      let positiveCount = 0
      let makeShortCount = 0
      let makeLongCount = 0
      for(let stock of stockMap.values()) {
        const currentDayStock = stock.result.find(item => item.date === startDateString)
        if (!currentDayStock) {
          continue
        }
        usedStockCount++

        if (currentDayStock.isMakeShort) {
          makeShortCount++
        }
        if (currentDayStock.isMakeLong) {
          makeLongCount++
        }
        if (currentDayStock.diff !== undefined) {
          if (currentDayStock.diff < -1 * 50) {
            halfNegativeCount++
          }
          if (currentDayStock.diff > 0) {
            positiveCount++
          }
        }
      }

      if (usedStockCount > 0) { // 排除非交易数据
        result.push({
          date: startDate.getTime(),
          dateString: startDateString,
          halfNegativeCount,
          positiveCount,
          makeShortCount,
          makeLongCount
        })
      }
    }

    return result
  }

  static isMakeShortPoint(yesterday, today) { // 是否当日交易量上升且价格下跌
    return today.diff > yesterday.diff && today.close < yesterday.close
  }

  static isMakeLongPoint(yesterday, today) {
    return today.diff < yesterday.diff && today.close > yesterday.close
  }

  static parseRawNoticeList(rawNoticeList) {
    return rawNoticeList.map(item => {
      return {
        title: item.NOTICETITLE,
        date: new Date(item.NOTICEDATE).getTime(),
        type: item["ANN_RELCOLUMNS"][0].COLUMNNAME,
        url: item.Url
      }
    })
  }

  static getStockThemeList(vueContext, stockCode) { // 获取主题列表
    const themeMap = vueContext.$store.state.data.themeMap
    return themeMap.get(stockCode)
  }
}
