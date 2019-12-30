import { $moment } from '@/utils'

export const STOCK_COORDINATE_DATE = '2019-06-19'

export const COORDINATE_TIME_LIST = [
  '09:31',
  '10:30',
  '11:30',
  '14:00',
  '15:00'
].map(item => `${ STOCK_COORDINATE_DATE } ${ item }:00`)

// 生成坐标轴
export const addStockDailyCoordinate = function(chartInstance) {
  chartInstance.scale('time', {
    type: 'timeCat',
    ticks: COORDINATE_TIME_LIST.map(item => $moment(item).toDate().getTime()),
    formatter: function(val) {
      let date_format = $moment(val).format('HH:mm')
      if (date_format === '11:30') {
        return '11:30/13:00'
      }
      return date_format
    }
  })
}
