<!-- 用于批量分析股票集的某一天走势 -->

<template>
  <div>
    <lr-chart ref="chart" @dblclick="showDetail"/>
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
    loadTodayData() { // 加载今日数据

    },
    loadHistoryData(stockList, date) { // 加载历史数据
      const targetDate = this.$moment(date).format('YYYY-MM-DD')
      return new Promise((resolve, reject) => {
        Promise.all(stockList.map(item => this.$store.dispatch('loadStockData', item.code))).then(_ => {
          const chartDataList = []

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

            model.time = targetDate
            model.range = [ model.start, model.end, model.max, model.min ];


            if (model.end >= model.start) {
              model.trend = '上涨'
            } else {
              model.trend = '下跌'
            }
            chartDataList.push(model)
          })

          resolve(chartDataList)
        }).catch(_ => {
          reject(_)
        })
      })
    },
    loadData(conceptModel, stockList, date) {
      this.loadHistoryData(stockList, date).then(chartDataList => {
        // 加入一个空点，防止左侧坐标轴被覆盖
        chartDataList.unshift({})

        chartDataList.forEach((item, itemIndex) => {
          item.count = itemIndex
        })

        this.renderChart(chartDataList)
      }).catch(_ => {
        this.$message.error(_)
      })


    },
    renderChart(dataList) {
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
        .tooltip('name*time*start*end*max*min*volume*code')

      chart.render();
    },
    showDetail(meta) {
      const code = meta.data.code
      this.$bus.$emit('showStockDetail', {
        code
      })
    }
  }
}
</script>
