import { $moment } from '@/utils'

export const STOCK_COORDINATE_DATE = '2019-06-19'

export const COORDINATE_TIME_LIST = [
  '09:30',
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

const getTooltipItemHtml = function(name, value, color){
  return `<div class="lr-tooltip__item">
            <div class="lr-tooltip__item--label">${ name }</div>
            <div class="lr-tooltip__item--value" style="color:${color}">${ value }</div>
          </div>`
}

export const generateTooltip = function(title, itemList) { // 生成自定义tooltip
  return `<div class="lr-tooltip" style="position: absolute">
            <div class="lr-tooltip__header">${ title }</div>
            <div class="lr-tooltip__body">${ itemList.map(item => getTooltipItemHtml(item.name, item.value, item.color)).join('') }</div>
          </div>`

}
