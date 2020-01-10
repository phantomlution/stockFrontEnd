<template>
  <div>
    <el-button @click.stop="test">test</el-button>
    <lr-chart ref="chart" @dblclick="dblclick" />
  </div>
</template>

<script>
import { increment } from '@/utils'
import lodash from 'lodash'

export default {
  name: 'KLine',
  data() {
    return {

    }
  },
  methods: {
    test() {
      this.loadData()
    },
    loadData() {
      const code = 'SZ000001'
      return this.$store.dispatch('loadStockData', code).then(_ => {
        // 生成 model
        const chartDataList = lodash.takeRight(_.result, 200)
        this.renderChart(chartDataList)
      })
    },
    parseDataList(rawDataList) {
      const result = rawDataList.map(item => {
        const model = {
          start: item.open,
          end: item.close,
          max: item.max,
          min: item.min,
          volume: item.volume,
          amount: lodash.round(item.amount / 10000 / 10000, 2),
          date: item.date
        }

        model.range = [model.start, model.end, model.max, model.min]
        if (model.end >= model.start) {
          model.trend = '上涨'
        } else {
          model.trend = '下跌'
        }

        return model
      })

      this.beautify(result)

      return result
    },
    beautify(dataList) { // 点数过少，左侧坐标轴会被遮挡，左右各补上一个点
      if (dataList.length >= 60) {
        return
      }

      // number | date
      const firstDate = dataList[0].date
      const lastDate = dataList[dataList.length - 1].date
      if (isNaN(firstDate)) { // date
        dataList.unshift({
          date: this.$moment(firstDate).add('days', -1).format('YYYY-MM-DD'),
          range: null
        })
        dataList.push({
          date: this.$moment(lastDate).add('days', 1).format('YYYY-MM-DD'),
          range: null
        })
      } else { // number
        dataList.unshift({
          date: firstDate - 1,
          range: null
        })
        dataList.push({
          date: lastDate + 1,
          range: null
        })
      }

    },
    renderChart(rawDataList, config = {}) {
      const dataList = this.parseDataList(rawDataList)
      const { scale } = config

      const chart = this.$refs.chart.getChart()
      chart.source(dataList, {
        date: {
          type: 'timeCat',
          nice: false,
          range: [ 0, 1 ]
        },
        trend: {
          values: [ '上涨', '下跌' ]
        },
        ...scale
      })

      chart.legend(false)

      chart.tooltip({
        showTitle: false,
        itemTpl: '<li data-index={index}>'
        + '<span style="background-color:{color};" class="g2-tooltip-marker"></span>'
        + '{name}{value}</li>'
      });

      const kView = chart.view()
      kView.area().position('date*amount').color('#64b5f6')
      kView.axis('amount', {
        position: 'right'
      })
      kView.axis('range', {
        position: 'left'
      })

      kView.source(dataList)

      kView.schema()
        .position('date*range')
        .color('trend', val => {
          if (val === '上涨') {
            return '#f04864';
          }

          if (val === '下跌') {
            return '#2fc25b';
          }
        })
        .shape('candle')
        .tooltip('name*date*start*end*max*min*amount*code')

      chart.render()
    },
    dblclick(model) {
      this.$emit('dblclick', model)
    }
  }
}
</script>
