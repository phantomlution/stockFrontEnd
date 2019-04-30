import lodash from 'lodash'
import stockUtils from './stockUtils'

const RANGE_START_IN_DAYS = 10
const RANGE_END_IN_DAYS = 70

export default class Stock {

  constructor(base, rawData) {
    this.base = base
    this.code = base.code
    this.name = base.name
    this.rawData = rawData
    this.isDataContinuous = true
    this.result = this.getComputedData()
  }

  getComputedData() {
    const startDays = RANGE_START_IN_DAYS
    const endDays = RANGE_END_IN_DAYS
    const dayDiff = this.rawData.length - endDays

    const dateList = this.rawData.map(item => item.timestamp)
    if (stockUtils.hasEverSuspend(dateList)) {
      this.isDataContinuous = false
    }

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
      result.push({
        code: this.code,
        timestamp,
        totalDataCount: this.rawData.length,
        date: stockUtils.dateFormat(timestamp),
        lastDataTimestamp: timestamp,
        diff: lodash.round((waterFrequencyPercentStart - waterFrequencyPercentEnd) / waterFrequencyPercentEnd * 100, 2),
        last10: waterFrequencyPercentStart,
        last70: waterFrequencyPercentEnd
      })
    }

    this.result = result
  }
}
