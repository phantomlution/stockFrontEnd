<!-- 用于批量分析股票集的某一天走势 -->

<template>
  <div>
    <lr-chart ref="chart" />
  </div>
</template>

<script>
import { increment } from '@/utils'

export default {
  data() {
    return {
      date: null,
      stockList: []
    }
  },
  watch: {
    date() {
      this.loadData()
    }
  },
  methods: {
    analyze(stockList, date) {
      this.date = this.$moment(date).toDate()
      this.stockList = stockList
      this.loadData()
    },
    loadData() {
      if (this.stockList.length === 0 || !this.date) {
        return this.$message.error('数据不完整')
      }

      const targetDate = this.$moment(this.date).format('YYYY-MM-DD')
      Promise.all(this.stockList.map(item => this.$store.dispatch('loadStockData', item.code))).then(_ => {
        const chartDataList = []

        // 加入一个空点，防止左侧坐标轴被覆盖
        chartDataList.push({
          count: 0,
        })

        _.forEach(item => {
          const model = {
            "name": item.name,
            "code": item.code,
          }
          const currentItem = item.result.find(resultItem => resultItem.date === targetDate)
          if (!currentItem) {
            return this.$message.warning('找不到数据点')
          }

          const close = currentItem.yesterdayClose
          model.start = increment(currentItem.open, close)
          model.max = increment(currentItem.max, close)
          model.min = increment(currentItem.min, close)
          model.end = increment(currentItem.close, close)
          model.volume = currentItem.amountInMillion
//          model.start = currentItem.open
//          model.max = currentItem.max
//          model.min = currentItem.min
//          model.end = currentItem.close

          model.time = targetDate
          model.range = [ model.start, model.end, model.max, model.min ];


          if (model.end >= model.start) {
            model.trend = '上涨'
          } else {
            model.trend = '下跌'
          }
          model.count = chartDataList.length
          chartDataList.push(model)
        })

        this.renderChart(chartDataList)
      })
    },
    renderChart(dataList) {
      console.log(dataList)
      console.log('123')
      const chart = this.$refs.chart.getChart()
      chart.source(dataList, {
        count: {
          type: 'linear',
          nice: false,
          tickInterval: 1
        },
        trend: {
          values: [ '上涨', '下跌' ]
        },
      })

      chart.legend(false)

      chart.tooltip({
        showTitle: false,
        itemTpl: '<li data-index={index}>'
        + '<span style="background-color:{color};" class="g2-tooltip-marker"></span>'
        + '{name}{value}</li>'
      });

      const kView = chart.view({
        end: {
          x: 1,
          y: 0.5
        }
      });
      kView.source(dataList)
      kView.schema()
        .position('count*range')
        .color('trend', val => {
          if (val === '上涨') {
            return '#f04864';
          }

          if (val === '下跌') {
            return '#2fc25b';
          }
        })
        .shape('candle')
        .tooltip('name*time*start*end*max*min*volume')

//      const barView = chart.view({
//        start: {
//          x: 0,
//          y: 0.65
//        }
//      });
//      barView.source(dv, {
//        volumn: {
//          tickCount: 2
//        }
//      });
//      barView.axis('time', {
//        tickLine: null,
//        label: null
//      });
//      barView.axis('volumn', {
//        label: {
//          formatter: val => {
//            return parseInt(val / 1000, 10) + 'k';
//          }
//        }
//      });
//      barView.interval()
//        .position('time*volumn')
//        .color('trend', val => {
//          if (val === '上涨') {
//            return '#f04864';
//          }
//
//          if (val === '下跌') {
//            return '#2fc25b';
//          }
//        })
//        .tooltip('time*volumn', (time, volumn) => {
//          return {
//            name: time,
//            value: '<br/><span style="padding-left: 16px">成交量：' + volumn + '</span><br/>'
//          };
//        });

      chart.render();



    }
  }
}
</script>
