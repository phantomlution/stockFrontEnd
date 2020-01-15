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
  padding: {
    type: Array
  },
  isEmpty: {
    type: Boolean,
    default: false
  },
  legend: { // 是否使用图例
    type: Boolean,
    default: true
  },
  reUse: { // 是否复用组件（用于临时解决一些官方bug）
    type: Boolean,
    default: true
  }

}

export default {
  name: 'LrChart',
  props,
  data() {
    return {
      _chart: null,
      currentFocusItem: null, // 鼠标当前所在的点（由tooltip计算得出）
      chartId: idGenerator.next()
    }
  },
  beforeDestroy() {
    this.destroyChart()
  },
  methods: {
    destroyChart() {
      if (this._chart) {
        // 移除所有事件
        this._chart.off()
        this._chart.destroy()
      }
      this._chart = null
    },
    getChart() {
      if (!this.reUse) {
        this.destroyChart()
      }

      if (this._chart) {
        this._chart.clear()
      } else {

        let height = this.height
        if (this.height <= 1) { //
          height = window.innerHeight * this.height
        }

        let padding = [20, 80, 70, 80]
        if (this.padding) {
          padding = this.padding
        }

        this._chart = new G2.Chart({
          container: this.chartId,
          forceFit: true,
          width: window.innerWidth,
          height,
          animate: false,
          padding: padding
        })
        this.bindEvent()
      }

      return this._chart
    },
    _addHtmlAssistantLine(view, position, contentList) {
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
        this._addHtmlAssistantLine(view, position, contentList)
      }
    },
    bindEvent() {
      const chart = this._chart

      chart.on('tooltip:change', ev => {
        const itemList = ev.items || []
        const model = {
          title: '',
          data: null
        }

        if (itemList.length > 0) {
          const title = itemList[0].title
          const obj = {}
          itemList.forEach(item => {
            obj[item.name] = item.value
          })

          model.title = title
          model.data = obj
        }
        this.currentFocusItem = model
      })

      chart.on('tooltip:hide', ev => {
        this.currentFocusItem = null
      })

      chart.on('dblclick', ev => {
        if (this.currentFocusItem) {
          this.$emit('dblclick', this.currentFocusItem)
        }
      })
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

<style lang="scss">
.lr-tooltip{
  /*visibility: visible !important;*/
  /*display: block !important;*/
  font-size: 13px;
  background: #FFFFFF;
  border: 1px solid #97c8ff;
}

.lr-tooltip__header{
  text-align: center;
  background: #edf5ff;
  height: 30px;
  line-height: 30px;
  color: #000;
  font-weight: 400;
}

.lr-tooltip__body{
  padding: 8px;
}

.lr-tooltip__item{
  display: flex;
  width: 120px;
  line-height: 20px;
}

.lr-tooltip__item--label{
  width: 64px;
  color: #b0b0b0;
}

.lr-tooltip__item--value{
  flex: 1;
  text-align: right;
}
</style>

