<template>
  <div :id="chartId" class="lr-chart-wrapper">
    <div class="lr-chart__empty" v-if="isEmpty">暂无数据</div>
  </div>
</template>

<script>
  import { idGenerator } from '@/utils'
  import G2 from '@antv/g2'

  const props = {
    height: { // 高度比例
      type: Number,
      default: 0.8
    },
    usePadding: {
      type: Boolean,
      default: true
    },
    isEmpty: {
      type: Boolean,
      default: false
    }
  }

  export default {
    name: 'LrChart',
    props,
    data() {
      return {
        _chart: null,
        chartId: idGenerator.next()
      }
    },
    beforeDestroy() {
      if (this._chart) {
        this._chart.destroy()
      }
    },
    methods: {
      getChart() {
        if (this._chart) {
          this._chart.clear()
        } else {
          let height = this.height
          if (this.height <= 1) { //
            height = window.innerHeight * this.height
          }
          let padding = [20, 30, 60, 30]
          if (this.usePadding) {
            padding = [20, 80, 80, 80]
          }

          this._chart = new G2.Chart({
            container: this.chartId,
            forceFit: true,
            width: window.innerWidth,
            height,
            padding: padding
          })
        }

        return this._chart
      },
      addHtmlAssistantLine(view, position, contentList) {
        const contentHtml = contentList.map(content => {
          return `<div style="width: 10px;font-size: 10px;line-height: 12px;margin-bottom: 8px;color: #999">
            ${ content }
          </div>`
        })

        view.guide().html({
          position: position.end,
          html: `<div>${ contentHtml.join('') }</div>`,
          alignX: 'center',
          alignY: 'bottom',
          offsetX: 0
        });
      },
      addAssistantLine(view, position, content='', config={}) {
        const isHorizontal = config.horizontal || false
        const isVertical = !isHorizontal

        const contentList = []
        if (Array.isArray(content)) {
          Array.prototype.push.apply(contentList, content)
        } else {
          contentList.push(content)
        }

        const isTop = config.top || true
        const color = config.color || '#E6A23C'
        const isDashLine = config.dash === undefined ? true : config.dash

        const displayText = contentList.join(',')

        const textModel = {}
        textModel.position = config.textPosition || 'end'
        textModel.autoRotate = false
        textModel.content = displayText

        console.log(position)

        view.guide().line({
          top: isTop,
          start: position.start,
          end: position.end,
          lineStyle: {
            stroke: color,
            lineDash: [isDashLine ? 2 : 0 ],
            lineWidth: 2
          },
          text: isHorizontal ? textModel : ''
        })
        if (isVertical) {
          this.addHtmlAssistantLine(view, position, contentList)
        }
      }
    }
  }
</script>

<style lang="scss">
  .lr-chart-wrapper{
    position: relative;
  }

  .lr-chart__empty{
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    color: rgba(0, 0, 0, 0.65)
  }
</style>
