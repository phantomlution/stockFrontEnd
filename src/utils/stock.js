import lodash from 'lodash'
import stockUtils from './stockUtils'

const RANGE_START_IN_DAYS = 10
const RANGE_END_IN_DAYS = 70

export default class Stock {
  constructor(code, dataSource) {
    this.code = code
    this.dataSource = dataSource
  }

  getComputedData() {
    return new Promise((resolve, reject) => {
      const startDays = RANGE_START_IN_DAYS
      const endDays = RANGE_END_IN_DAYS
      const dayDiff = this.dataSource.length - endDays // 填写为70有比较好的模型效果，3是为了快速选股

      const dateList = this.dataSource.map(item => item.timestamp)
      if (stockUtils.hasEverSuspend(dateList)) {
        return reject({
          message: '数据不连续'
        })
      }

      const result = []
      for(let i = dayDiff; i>= 0; i--) {
        // 获取最后 N 天的数据
        let data = lodash.dropRight(this.dataSource, i)

        if (data.length < endDays) {
          return reject({
            message: '数据量不足'
          })
        }

        const waterFrequencyPercentStart = stockUtils.getWaterFrequencyPercentInDays(data, startDays)
        const waterFrequencyPercentEnd = stockUtils.getWaterFrequencyPercentInDays(data, endDays)
        const timestamp = data[data.length - 1].timestamp
        result.push({
          code: this.code,
          timestamp,
          totalDataCount: this.dataSource.length,
          date: stockUtils.dateFormat(timestamp),
          lastDataTimestamp: timestamp,
          diff: lodash.round((waterFrequencyPercentStart - waterFrequencyPercentEnd) / waterFrequencyPercentEnd * 100, 2),
          last10: waterFrequencyPercentStart,
          last70: waterFrequencyPercentEnd
        })
      }

      return resolve(result)
    })
  }
}
