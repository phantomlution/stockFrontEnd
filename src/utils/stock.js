import lodash from 'lodash'
import stockUtils from './stockUtils'

const RANGE_START_IN_DAYS = 5
const RANGE_END_IN_DAYS = 30

const RANGE_RECENT_TRADE_VOLUME = 200 // [基本面]近100日交易量

export default class Stock {

  constructor(base, rawData) {
    this.base = base
    this.code = base.symbol
    this.name = base.name
    this.rawData = rawData
    this.options = {}
    this.result = this.getComputedData()
    this.calculateOptions()
  }

  calculateOptions() { // 手动计算额外的数据
    for (let i=1; i<this.result.length; i++) {
      const todayData = this.result[i]
      const yesterdayData = this.result[i - 1]
      todayData.isMakeShort = stockUtils.isMakeShortPoint(yesterdayData, todayData)
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

      const waterFrequencyPercentStart = stockUtils.getWaterFrequencyPercentInDays(data, startDays)
      const waterFrequencyPercentEnd = stockUtils.getWaterFrequencyPercentInDays(data, endDays)
      const timestamp = data[data.length - 1].timestamp
      const todayData = data[data.length - 1]
      result.push({
        code: this.code,
        timestamp,
        close: todayData.close,
        percent: todayData.percent,
        totalDataCount: this.rawData.length,
        date: stockUtils.dateFormat(timestamp),
        lastDataTimestamp: timestamp,
        diff: lodash.round((waterFrequencyPercentStart - waterFrequencyPercentEnd) / waterFrequencyPercentEnd * 100, 2),
        lastStartDuration: waterFrequencyPercentStart,
        lastEndDuration: waterFrequencyPercentEnd
      })
    }

    return result
  }

}
