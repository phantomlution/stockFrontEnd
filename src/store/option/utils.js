import { $moment } from '@/utils'

/**
 * 提取指定月份的交割日期
 *
 * @param dayOfWeek
 * @param dayOfWeekOrder
 * @param startMonth
 *  开始计算的日期： 例如2019-12
 */
export const getDeliveryDate = function ({ dayOfWeek, dayOfWeekOrder }, startMonth) {
  const startDate = startMonth + '-01'
  // 星期日在 moment 中序号为 0
  dayOfWeek = dayOfWeek % 7

  let firstRoundDayOfWeek = null
  for(let i=0; i< 7; i++) {
    const currentDate = $moment(startDate).add(i, 'days').toDate()
    if (currentDate.getDay() === dayOfWeek) {
      firstRoundDayOfWeek = currentDate
      break
    }
  }

  const deliveryDate = $moment(firstRoundDayOfWeek).add(dayOfWeekOrder - 1, 'weeks')

  return deliveryDate.format('YYYY-MM-DD')
}

/**
 * 获取最近的一个要交割的日期
 *
 * @param deliveryModel
 */
export const getRecentDeliveryDate = function (deliveryModel) {
  const date = new Date()
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const today = $moment().format('YYYY-MM-DD')
  const startMonth = `${ year }-${ month > 10 ? '' : '0'}${ month }`
  const deliverDate = getDeliveryDate(deliveryModel, startMonth)
  if ($moment(deliverDate).toDate().getTime() < $moment(today).toDate().getTime()) { // 当月已到期
    const nextStartDate = $moment(startMonth + '-01').add(1, 'months').format('YYYY-MM')
    return getDeliveryDate(deliveryModel, nextStartDate)
  } else {
    return deliverDate
  }
}
