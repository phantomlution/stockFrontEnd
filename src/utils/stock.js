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
    this.type = base.type

    // 昨日成交量
    this.oneNightAmount = lodash.round(lodash.meanBy(lodash.takeRight(rawData, 1), item => item.amount), 2)
    // 近一周成交量(5天)
    this.oneWeekAmount = lodash.round(lodash.meanBy(lodash.takeRight(rawData, 5), item => item.amount), 2)
    // 近一月成交量
    this.oneMonthAmount = lodash.round(lodash.meanBy(lodash.takeRight(rawData, 22), item => item.amount), 2)
    // 近一季度成交量
    this.oneSeasonAmount = lodash.round(lodash.meanBy(lodash.takeRight(rawData, 22 * 3), item => item.amount), 2)

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

    return this.rawData.map(todayData => {

      return {
        code: this.code,
        date: todayData.date,
        close: todayData.close,
        max: todayData.max,
        min: todayData.min,
        open: todayData.open,
        amount: todayData.amount,
        yesterdayClose: todayData.pre_close
      }
    })
  }
}
