<template>
  <div>
    <input type="file" @change="handleFile" />

    <div :id="chartId" />
  </div>
</template>

<script>
import XLSX from 'xlsx'
import { idGenerator } from '@/utils'
import lodash from 'lodash'

export default {
  data() {
    return {
      chartId: idGenerator.next(),
      chart: null
    }
  },
  mounted() {
    this.chart = new G2.Chart({
      container: this.chartId,
      forceFit: true,
      width: window.innerWidth,
      height: window.innerHeight,
      padding: [20, 80, 80, 80]
    })
  },
  methods: {
    handleFile(e) {
      const $this = this
      var rABS = false
      var files = e.target.files, f = files[0]
      var reader = new FileReader()
      reader.onload = function(e) {
        var data = e.target.result
        if(!rABS){
          data = new Uint8Array(data)
        }
        var workbook = XLSX.read(data, {type: rABS ? 'binary' : 'array'});
        const rawData = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]])
        $this.updateChart(rawData)
      }
      if(rABS){
        reader.readAsBinaryString(f)
      } else {
        reader.readAsArrayBuffer(f)
      }
    },
    updateChart(rawData) {
      const chart = this.chart
      chart.clear()
      const soldData = rawData.filter(item => item.actualSellDate).filter(item => item.waitBuyInDays === 1).map(item => {
        item.color = item.profitPercent > 0 ? 'red' : 'green'
        item.profitPercent = item.profitPercent * 100
        return item
      })
      this.analyzeData(soldData)
      chart.source(soldData)
      chart.point().position('holeDays*profitPercent').color('color').size(4).opacity(0.65).shape('circle');
      chart.render();
    },
    analyzeData(data) {
      const result = `
          共${ data.length }个数据
          \n盈利${ data.filter(item => item.profitPercent >= 0).length }个
          \n亏损${ data.filter(item => item.profitPercent < 0).length }个
          \n盈利平均${ lodash.round(lodash.mean(data.filter(item => item.profitPercent >= 0).map(item => item.profitPercent)) ,2)}
          \n亏损平均${ lodash.round(lodash.mean(data.filter(item => item.profitPercent < 0).map(item => item.profitPercent)) ,2)}
          \n平均持仓天数${ lodash.round( lodash.mean(data.map(item => item.holeDays)), 2)}
      `

      console.log(result)
    }

  }
}
</script>
