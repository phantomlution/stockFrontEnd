<template>
  <div :id="chartId"></div>
</template>

<script>
import { idGenerator } from '@/utils'
import G2 from '@antv/g2'

const props = {
  height: { // 高度比例
    type: Number,
    default: 0.8
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
        this._chart = new G2.Chart({
          container: this.chartId,
          forceFit: true,
          width: window.innerWidth,
          height: window.innerHeight * this.height,
          padding: [20, 80, 80, 80]
        })
      }

      return this._chart
    }
  }
}
</script>
