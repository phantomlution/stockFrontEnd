import lodash from 'lodash'
import stockUtils from './stockUtils'
import moment from 'moment'

const RANGE_START_IN_DAYS = 4
export const RANGE_END_IN_DAYS = RANGE_START_IN_DAYS * 4
export const STOCK_PRICE_MIN = 4
export const STOCK_PRICE_MAX = 99999

const RANGE_RECENT_TRADE_VOLUME = 200 // [基本面]近100日交易量

export default class Stock {

  constructor(base, rawData) {
    this.base = base
    this.code = base.symbol
    this.name = base.name
    // 调整部分单位
    rawData.map(item => {
      item.amountInMillion = lodash.round(item.amount / (100 * 10000), 2)
    })
    this.rawData = rawData
    this.label = `${ base.name }(${ base.symbol })`
    this.options = {}
    this.result = this.getComputedData()
    this.calculateOptions()
  }

  calculateOptions() { // 手动计算额外的数据
    for (let i=1; i<this.result.length; i++) {
      const todayData = this.result[i]
      const yesterdayData = this.result[i - 1]
      todayData.isMakeShort = stockUtils.isMakeShortPoint(yesterdayData, todayData)
      todayData.isMakeLong = stockUtils.isMakeLongPoint(yesterdayData, todayData)
    }

    let dataList = lodash.takeRight(this.result.filter(item => item.diff !== undefined), RANGE_RECENT_TRADE_VOLUME)
    if (dataList.length === RANGE_RECENT_TRADE_VOLUME) {
      dataList = dataList.map(item => Math.abs(item.diff))
      dataList.sort()
      dataList = dataList.filter((item, itemIndex) => itemIndex <= RANGE_RECENT_TRADE_VOLUME / 2)
      const result = dataList[dataList.length - 1]
      this.options.recentOneHundreadNegativeVolumePercent = result
    }
  }

  getComputedData() {
    const startDays = RANGE_START_IN_DAYS
    const endDays = RANGE_END_IN_DAYS
    const dayDiff = this.rawData.length - endDays

    const dateList = this.rawData.map(item => item.timestamp)
    this.options.isDataContinuous = !stockUtils.hasEverSuspend(dateList)

    const result = []
    for(let i = dayDiff; i>= 0; i--) {
      // 获取最后 N 天的数据
      let data = lodash.dropRight(this.rawData, i)

      if (data.length < endDays) {
        continue
      }

      const amountInMillionStart = stockUtils.getAmountInMillionInDays(data, startDays)
      const amountInMillionEnd = stockUtils.getAmountInMillionInDays(data, endDays)
      const timestamp = data[data.length - 1].timestamp
      const todayData = data[data.length - 1]
      result.push({
        code: this.code,
        timestamp,
        close: todayData.close,
        percent: todayData.percent,
        amount: todayData.amount,
        amountInMillion: todayData.amountInMillion,
        totalDataCount: this.rawData.length,
        turnoverRate: todayData.turnoverRate,
        date: stockUtils.dateFormat(timestamp),
        lastDataTimestamp: timestamp,
        diff: lodash.round((amountInMillionStart - amountInMillionEnd) / amountInMillionEnd * 100, 2),
        lastStartDuration: amountInMillionStart,
        lastEndDuration: amountInMillionEnd
      })
    }

    return result
  }

  getRecentRestrictCount(days) { // 近期（前后）发生解禁的数量
    let count = 0
    const restrictSellList = this.base.restrict_sell_list || []
    const today = moment()
    restrictSellList.forEach(item => {
      let diff = today.diff(moment(item.date), 'days')
      if (Math.abs(diff) <= days) {
        count += 1
      }
    })

    return count
  }



}
