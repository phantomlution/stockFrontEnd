// 所有的统计数据
import { chineseForeignExchange } from './foreignExchange'

// 处理数据
function processData(statisticItem) {
  const chartData = []
  statisticItem.data.forEach(item => {
    if (!isNaN(item.value)) {
      chartData.push({
        type: 'real',
        date: item.date,
        value: Number(item.value),
      })
    }
    if (!isNaN(item.predict)) {
      chartData.push({
        type: 'predict',
        date: item.date,
        value: Number(item.predict)
      })
    }

  })
  statisticItem.chart = chartData
}

export default {
  chineseForeignExchange: processData(chineseForeignExchange)
}
