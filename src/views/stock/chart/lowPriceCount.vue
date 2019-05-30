<template>
  <lr-box :title="title" v-show="chart">
    <div :id="chartId"></div>
  </lr-box>
</template>

<script>
  import { idGenerator } from '@/utils'
  import G2 from '@antv/g2'
  import lodash from 'lodash'
  import { RANGE_END_IN_DAYS } from '@/utils/stock'

  export default {
    data() {
      return {
        chart: null,
        chartId: idGenerator.next()
      }
    },
    mounted() {
      this.$bus.$on('analyzeLowPriceCount', result => {
        this.updateChart(result)
      })
    },
    computed: {
      title() {
        return `近${ RANGE_END_IN_DAYS }个交易日价格`
      }
    },
    beforeDestroy() {
      this.$bus.$off('analyzeLowPriceCount')
    },
    methods: {
      updateChart(data) {
        if (this.chart) {
          this.chart.clear()
        } else {
          this.chart = new G2.Chart({
            container: this.chartId,
            width: window.innerWidth,
            height: window.innerHeight / 2,
            padding: [20, 80, 80, 80]
          })
        }
        const chart = this.chart
        var scale = {
          date: {
            alias: '日期',
            type: 'time',
            mask: 'YYYY-MM-DD'
          },
        }

        const chartData = []

        const fivePercentCount = data.map(item => {
          return {
            date: item.date,
            type: 'fivePercentCount',
            value: item.fivePercentCount
          }
        })


        const tenPercentCount = data.map(item => {
          return {
            date: item.date,
            type: 'tenPercentCount',
            value: item.tenPercentCount
          }
        })

        Array.prototype.push.apply(chartData, fivePercentCount)
        Array.prototype.push.apply(chartData, tenPercentCount)

        chart.source(chartData, scale);
        chart.tooltip({
          crosshairs: {
            type: 'line'
          }
        });
        chart.line().position('date*value').color('type');
        chart.render()
      }
    }
  }
</script>
