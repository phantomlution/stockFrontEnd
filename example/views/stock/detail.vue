<template>
  <div style="height: 100vh">
    <div>
      <div>
        <el-input-number v-model="analyzeModel.dataCount" :step="50" :min="70" />
        <el-button type="primary" @click.stop="downloadExcel">导出数据</el-button>
        <el-button type="primary" @click.stop="startBash">启动脚本</el-button>
        <el-select v-model="analyzeModel.code" filterable :filter-method="throttleSearch" v-show="true">
          <el-option v-for="item in analyzeModel.currentCodeList" :key="item.value" :label="`(${ item.label}) ${ item.value }`" :value="item.value"></el-option>
        </el-select>
      </div>
      <div>
        <div :id="chartId"></div>
      </div>
      <div>
        <div :id="secondChartId"></div>
      </div>
    </div>
  </div>
</template>

<script>
import G2 from '@antv/g2'
import { idGenerator } from '@/utils'
import lodash from 'lodash'
import moment from 'moment'

export default {
  data() {
    return {
      chart: null,
      chartId: idGenerator.next(),
      secondChart: null,
      secondChartId: idGenerator.next(),
      throttleSearch: null,
      collector: [],
      analyzeModel: {
        codeList: [],
        currentCodeList: [],
        code: 'SZ000007',
        dataCount: 70,
        base: null,
        source: []
      }
    }
  },
  watch: {
    'analyzeModel.dataCount'(val) {
      this.analyze()
    },
    'analyzeModel.code'(val) {
      this.loadData(val)
    },
    collector(val) {
      console.log('gotcha')
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

    this.secondChart = new G2.Chart({
      container: this.secondChartId,
      forceFit: true,
      height: window.innerHeight
    })

    this.loadData(this.analyzeModel.code)
    this.throttleSearch = lodash.throttle(this.filterStockItem, 50)
    this.loadStockList()
  },
  destroyed() {
    this.throttleSearch = null
  },
  methods: {
    startBash() {
      const stockList = this.analyzeModel.currentCodeList
      let i = 0
      let requestInterval = setInterval(_ => {
        if (stockList[i]) {
          this.loadData(stockList[i].value)
          i++
        } else {
          if (requestInterval) {
            clearInterval(requestInterval)
          }
        }
      }, 50)
    },
    loadStockList() {
      this.$http.get('/api/stock/list').then(response => {
        const codeNameMap = new Map()
        response.nameList.forEach(item => {
          codeNameMap.set(item.code, item.name)
        })

        const codeList = response.idList.map(item => ({
          value: item.symbol,
          label: codeNameMap.get(item.symbol)
        }))
        this.analyzeModel.codeList = codeList
        this.filterStockItem()
      }).catch(_ => {
        console.log(_)
      })
    },
    loadData(code, collector = this.collector) {
      Promise.all([
        this.$http.post('/api/stock/detail', { code: code }),
        this.$http.post('/api/stock/base', { symbol: code })
      ]).then(responseList => {
        let floatShare = responseList[1].float_shares
        const base = responseList[1]
        this.analyzeModel.base = base
        let data = responseList[0].data
        data.forEach(item => {
          item.waterFrequencyPercent = lodash.round(item.volume / floatShare * 100, 2)
          if (Math.abs(item.percent) > 10) {
            item.waterFrequencyPercent = null
          }
        })
        this.analyzeModel.source = data
        this.analyze()
        this.getStockRepositoryGraph(data, base.symbol, collector)
      }).catch(_ => {
        console.log(_)
      })
    },
    filterStockItem(query) {
      if (!query) {
        this.analyzeModel.currentCodeList =  this.analyzeModel.codeList
        return
      }
      this.analyzeModel.currentCodeList = this.analyzeModel.codeList.filter(item => {
        return item.label.indexOf(query) !== -1 || item.value.indexOf(query) !== -1
      })
    },
    getBase() {
      return this.analyzeModel.base
    },

    downloadExcel() {
      if (this.collector.length === 0) {
        return this.$message.error('没有要导出的数据')
      }
      const keyList = Object.keys(this.collector[0])

      const result = []
      result.push(keyList)


      this.collector.forEach(item => {
        result.push(keyList.map(key => item[key]))
      })

      this.$excel.export({
        data: result
      })
    },
    getWaterFrequencyPercentInDays(data, lastDays) {
      const calculateDataList = lodash.takeRight(data, lastDays)
      const waterList = calculateDataList.map(item => item.waterFrequencyPercent).filter(item => item !== null)
      return lodash.round(lodash.mean(waterList), 2)
    },
    getStockRepositoryGraph(dataSource, code, collector) {
      const dayDiff = 200
      const startDays = 10
      const endDays = 70

      console.log(dataSource)

      const result = []
      for(let i = dayDiff; i>= 0; i--) {
        let data = lodash.dropRight(dataSource, i)

        if (data.length < dayDiff) {
          throw new Error('数据量不足')
        }
        const waterFrequencyPercentStart = this.getWaterFrequencyPercentInDays(data, startDays)
        const waterFrequencyPercentEnd = this.getWaterFrequencyPercentInDays(data, endDays)
        const timestamp = data[data.length - 1].timestamp
        result.push({
          code,
          timestamp,
          date: moment(timestamp).format('YYYY-MM-DD'),
          diff: lodash.round((waterFrequencyPercentStart - waterFrequencyPercentEnd) / waterFrequencyPercentEnd * 100, 2),
          last10: waterFrequencyPercentStart,
          last70: waterFrequencyPercentEnd
        })
      }
      if (collector) {
        const eureka = result.find(item => item.diff < -50)
        if (eureka) {
          collector.push(eureka)
        }
      }

      this.updateStockRepositoryGraph(result)
    },
    updateStockRepositoryGraph(data) {
      const chart = this.secondChart
      chart.clear()
      var scale = {
        timestamp: {
          alias: '日期',
          type: 'time',
          mask: 'YYYY-MM-DD'
        },
      }

      chart.source(data, scale);
      chart.tooltip({
        crosshairs: {
          type: 'line'
        }
      });
      chart.line().position('timestamp*diff').tooltip('timestamp*diff*last10*last70');
      chart.point().position('timestamp*diff').size(4).shape('circle').style({
        stroke: '#fff',
        lineWidth: 1
      });
      chart.guide().line({
        start: {
          timestamp: 'min',
          diff: -50
        },
        end: {
          timestamp: 'max',
          diff: -50
        },
        text: {
          position: 'start',
          content: `-50%`
        }
      })
      chart.render();
    },
    analyze() {
      let data = lodash.takeRight(this.analyzeModel.source, this.analyzeModel.dataCount)
      const closeValueList = data.map(item => item.close)
      const waterList = data.map(item => item.waterFrequencyPercent).filter(item => item !== null)

      const waterFrequencyPercent = lodash.round(lodash.mean(waterList), 2)
      const average = lodash.round(lodash.mean(closeValueList), 2)
      const base = this.getBase()
      const waterFrequentCapitalScale = lodash.round(waterFrequencyPercent / 100 * base.float_shares * average /10000 / 10000, 2)

      const guide = {
        average,
        waterFrequencyPercent,
        waterFrequentCapitalScale
      }
      this.updateChart(data, guide)
    },
    updateChart(data, { waterFrequencyPercent, average }) {
      const chart = this.chart
      chart.clear()
      function pick(data, field) {
        return data.map(function(item) {
          var result = {};
          for (var key in item) {
            if (item.hasOwnProperty(key) && field.indexOf(key) !== -1) {
              result[key] = item[key];
            }
          }
          return result;
        });
      }


      chart.scale({
        volume: {
          sync: true
        }
      });
      var scale = {
        timestamp: {
          alias: '日期',
          type: 'time',
          mask: 'YYYY-MM-DD'
        },
        close: {
          alias: 'close',
          min: 0
        },
        waterFrequencyPercent: {
          alias: 'waterFrequencyPercent',
          formatter: function formatter(value) {
            return value
          }
        },
      };
      var view1 = chart.view();
      view1.source(pick(data, ['close', 'waterFrequencyPercent', 'timestamp', 'percent']), scale);
      view1.axis('waterFrequencyPercent', {
        grid: null
      });
      view1.line().position('timestamp*close').tooltip('timestamp*close*percent').color('#4FAAEB').size(2);
      view1.line().position('timestamp*waterFrequencyPercent').color('#9AD681').size(2);

      view1.guide().line({
        start: {
          timestamp: 'min',
          waterFrequencyPercent: waterFrequencyPercent
        },
        end: {
          timestamp: 'max',
          waterFrequencyPercent: waterFrequencyPercent
        },
        text: {
          content: `${ waterFrequencyPercent }%`
        }
      })

      view1.guide().line({
        start: {
          timestamp: 'min',
          close: average
        },
        end: {
          timestamp: 'max',
          close: average
        },
        text: {
          content: average
        }
      })
      chart.render();
    }
  }
}
</script>
