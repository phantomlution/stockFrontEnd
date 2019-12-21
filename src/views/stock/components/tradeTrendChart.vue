<template>
  <lr-box>
    <div slot="title">
      <lr-stock-detail-link :add="showAdd" :code="code" :name="name" />
      <span style="display: inline-block; font-size: 14px;margin-left: 8px">
        近一个月成交额: {{ average }} million
      </span>
    </div>
    <el-input-number slot="center" v-model="dataCount" :step="50" :min="70" :max="maxDataCount" />
    <lr-chart ref="chart" />
  </lr-box>
</template>

<script>
import lodash from 'lodash'
import moment from 'moment'

const THRESHOLD_WATER_PERCENT = 50

const props = {
  code: {
    type: String,
    default: ''
  },
  showAdd: {
    type: Boolean,
    default: false
  },
  config: {
    type: Object
  }
}
export default {
  props,
  data() {
    return {
      dataCount: 70,
      maxDataCount: 420,
      name: '',
      average: ''
    }
  },
  watch: {
    code() {
      this.updateChart()
    },
    dataCount() {
      this.updateChart()
    }
  },
  mounted() {
    this.updateChart()
  },
  methods: {
    updateChart() {
      if (!this.code) {
        return
      }
      this.$store.dispatch('loadStockData', this.code).then(stock => {
        this.renderChart({
          stock,
          dataCount: this.dataCount
        })
      }).catch(_ => {

      })
    },
    calculateAmount(data) {
      this.average = ''
      const recentDataList = lodash.takeRight(data, 30)
      // 计算最近一个自然月的平均成交量
      const average = lodash.round(lodash.mean(recentDataList.map(item => item.amountInMillion)), 2)
      this.average = average
    },
    renderChart({stock, dataCount}) {
      let rawData = stock.result
      this.stock = stock
      this.code = stock.code
      this.name = stock.name
      const data = lodash.takeRight(rawData, dataCount)
      this.calculateAmount(data)

      const chart = this.$refs.chart.getChart()

      const view = chart.view()
      var scale = {
        timestamp: {
          alias: '日期',
          type: 'time',
          mask: 'YYYY-MM-DD'
        }
      }

      view.source(data, scale);
      view.line().position('timestamp*close').color('#4FAAEB').tooltip('close*percent').size(2);
      view.line().position('timestamp*diff').color('#9AD681').tooltip('amountInMillion*diff');

      // 追加限售解禁信息
      const restrict_sell_list = stock.base.restrict_sell_list || []
      restrict_sell_list.forEach(item => {
        view.guide().line({
          start: [item.timestamp, 'min'], // 使用数组格式
          end: [item.timestamp, 'max'],
          text: {
            position: 'end',
            autoRotate: false,
            content: `${ item.date.substring(5) }解禁`
          }
        })
      })

      // 追加高亮点

      const highlight = this.config ? this.config.highlight || [] : []
      highlight.forEach(item => {
        view.guide().line({
          start: [item.timestamp, 'min'], // 使用数组格式
          end: [item.timestamp, 'max'],
          lineStyle: {
            stroke: '#E6A23C',
            lineWidth: 2
          },
          text: {
            position: 'end',
            autoRotate: false,
            content: `${ item.date }当前点`
          }
        });
      })

      for(let i=1; i<data.length; i++) {
        const today = data[i]
        // 添加涨停提示
        if (today.percent >= 9.9) {
          this.addExtraInfoPoint(view, [today.timestamp, today.close], '涨停')
        }

        if (today.isMakeShort) {
          this.addMakeShortPoint(view, [today.timestamp, today.close])
        } else if (today.isMakeLong){
          this.addMakeLongPoint(view, [today.timestamp, today.close])
        }
        const yesterday = data[i - 1]
        if (today.isMakeShort && yesterday.isMakeShort) {
          this.addMakeShortGuideLine(view, [today.timestamp, today.close], [yesterday.timestamp, yesterday.close])
        } else if (today.isMakeLong && yesterday.isMakeLong) {
          this.addMakeLongGuideLine(view, [today.timestamp, today.close], [yesterday.timestamp, yesterday.close])
        }
      }

      view.guide().line({
        start: {
          timestamp: 'min',
          diff: -1 * THRESHOLD_WATER_PERCENT
        },
        end: {
          timestamp: 'max',
          diff: -1 * THRESHOLD_WATER_PERCENT
        },
        text: {
          position: 'start',
          content: `-${ THRESHOLD_WATER_PERCENT }%`
        }
      })

      const secondPhaseMap = this.$store.state.data.secondPhaseMap
      const secondPhaseItem = secondPhaseMap.get(stock.code)
      if (secondPhaseItem) {
        if (secondPhaseItem.secondPhaseResult) {
          secondPhaseItem.secondPhaseResult.forEach(phaseItem => {
            view.guide().region({
              top: true,
              start: {
                timestamp: moment(phaseItem.startDate).toDate().getTime(),
                close: phaseItem.startClose
              },
              end: {
                timestamp: moment(phaseItem.offsetEndDate).toDate().getTime(),
                close: phaseItem.offsetEndClose
              },
              style: {
                lineWidth: 1, // 辅助框的边框宽度
                fill: '#f00', // 辅助框填充的颜色
                fillOpacity: 1,
                stroke: '#f00' // 辅助框的边框颜色设置
              },

            })
          })
        }

      }

      chart.render();
    },
    addExtraInfoPoint(view, start, text) { // 添加涨停
      view.guide().dataMarker({
        top: false,
        position: start,
        content: text,
        style: {
          point: {
            stroke: 'orange'
          }
        }
      });
    },
    addMakeShortPoint(view, start) {
      view.guide().dataMarker({
        position: start,
        content: '',
        style: {
          point: {
            stroke: 'red'
          }
        }
      })
    },
    addMakeLongPoint(view, start) {
      view.guide().dataMarker({
        position: start,
        content: '',
        style: {
          point: {
            stroke: 'green'
          }
        }
      });
    },
    addMakeShortGuideLine(view, start, end) {
      view.guide().line({
        top: true,
        lineStyle: {
          stroke: '#f00',
          lineDash: [0],
          lineWidth: 3,
        },
        start: start,
        end: end
      })
    },
    addMakeLongGuideLine(view, start, end) {
      view.guide().line({
        top: true,
        lineStyle: {
          stroke: '#0f0',
          lineDash: [0],
          lineWidth: 3,
        },
        start: start,
        end: end
      })
    }
  }
}
</script>
