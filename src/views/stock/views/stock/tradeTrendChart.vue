<template>
  <lr-box :title="title">
    <lr-chart ref="chart" />
  </lr-box>
</template>

<script>
import lodash from 'lodash'
import moment from 'moment'

const THRESHOLD_WATER_PERCENT = 50

export default {
  data() {
    return {
      title: '',
      stock: null,
    }
  },
  methods: {
    updateChart({stock, dataCount, lastDatePoint}) {
      let rawData = stock.result
      this.stock = stock
      if (lastDatePoint) {
        rawData = rawData.filter(item => item.timestamp <= lastDatePoint.getTime())
      }
      this.title = stock.label
      const data = lodash.takeRight(rawData, dataCount)

      const chart = this.$refs.chart.getChart()
      chart.clear()

      const view = chart.view()
      var scale = {
        timestamp: {
          alias: '日期',
          type: 'time',
          mask: 'YYYY-MM-DD'
        }
      }

      view.source(data, scale);
      view.line().position('timestamp*close').color('#4FAAEB').tooltip('timestamp*close*percent').size(2);
      view.line().position('timestamp*diff').color('#9AD681').tooltip('timestamp*diff*lastStartDuration*lastEndDuration');

      for(let i=1; i<data.length; i++) {
        const today = data[i]
        // 添加涨停提示
        if (today.percent >= 9.9) {
          this.addLimitUpPoint(view, [today.timestamp, today.close])
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
    addLimitUpPoint(view, start) { // 添加涨停
      view.guide().dataMarker({
        top: false,
        position: start,
        content: '涨停',
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
