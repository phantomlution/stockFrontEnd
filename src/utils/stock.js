import lodash from 'lodash'
import stockUtils from './stockUtils'

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

  }

  getComputedData() {
    const dateList = this.rawData.map(item => item.timestamp)
    this.options.isDataContinuous = !stockUtils.hasEverSuspend(dateList)

    const result = []
    return this.rawData.map(todayData => {
      const timestamp = todayData.timestamp
      return {
        code: this.code,
        timestamp,
        close: todayData.close,
        max: todayData.max,
        min: todayData.min,
        open: todayData.open,
        percent: todayData.percent,
        amount: todayData.amount,
        amountInMillion: todayData.amountInMillion,
        turnoverRate: todayData.turnoverRate,
        date: stockUtils.dateFormat(timestamp),
        lastDataTimestamp: timestamp,
        yesterdayClose: lodash.round(todayData.close / (1 + todayData.percent / 100) , 2),
      }
    })
  }
}
