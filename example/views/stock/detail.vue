<template>
  <div style="height: 100vh;overflow: auto">
    <div>
      <div>
        <el-input-number v-model="analyzeModel.dataCount" :step="50" :min="70" />
        <el-button type="primary" @click.stop="downloadExcel">导出数据</el-button>
        <el-button type="primary" @click.stop="startBash">启动脚本</el-button>
        <el-select v-model="analyzeModel.code" filterable :filter-method="throttleSearch" v-show="true">
          <el-option v-for="item in analyzeModel.currentCodeList" :key="item.value" :label="`(${ item.label}) ${ item.value }`" :value="item.value"></el-option>
        </el-select>
        <el-button @click.stop="refresh">刷新</el-button>
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

const waterPercentThreshold = 50

export default {
  data() {
    return {
      chart: null,
      chartId: idGenerator.next(),
      secondChart: null,
      secondChartId: idGenerator.next(),
      throttleSearch: null,
      autoLoad: true,
      collector: [],
      useChart: true,
      chooseStock: true,
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
      this.$message.success('正在重新加载')
      this.useChart = true
      this.chooseStock = false
      this.loadData(val)
    },
    collector() {
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
    if (this.autoLoad) {
     this.refresh()
    }
    this.throttleSearch = lodash.throttle(this.filterStockItem, 50)
    this.loadStockList()
  },
  destroyed() {
    this.throttleSearch = null
  },
  methods: {
    refresh() {
      this.loadData(this.analyzeModel.code)
    },
    startBash() {
      this.useChart = false
      let stockList = this.analyzeModel.currentCodeList
      stockList.forEach(stockItem => {
        setTimeout(_ => {
          this.loadData(stockItem.value)
        }, 0)
      })
    },
    dateFormat(timestamp) {
      if (!timestamp) {
        return ''
      }
      return moment(timestamp).format('YYYY-MM-DD')
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
        if (!responseList[0]) {
          throw new Error('找不到该数据')
        }

        const base = responseList[1]
        if (!base.float_shares) {
          base.float_shares = base.total_shares // 基金股票
        }
        let floatShare = base.float_shares
        const stockName = base.name.toUpperCase()
        if (stockName.indexOf('ST') !== -1) {
          throw new Error('不考虑垃圾股')
        }
        if (stockName.indexOf('债') !== -1) {
          throw new Error('跳过债券')
        }
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
        this.getStockRepositoryGraph(data, base.symbol, collector, base)
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
    getPrice(dataSource, timestamp) {
      const current = dataSource.filter(item => item.timestamp === timestamp)
      if (current.length === 0) {
        throw new Error('找不到交易数据数据')
      } else if (current.length > 1) {
        throw new Error('历史数据被人篡改')
      }
      return current[0]
    },
    canByIn(expectPrice, todayHigh, todayLow, close, percent) {
      if (expectPrice > todayLow && expectPrice < todayHigh) {
        return true
      }
      // 若当天买入价高于当天最高价，且单日涨跌停价格不超过10%，也可以买入
      if (expectPrice >= todayHigh && (expectPrice / (close / (1 + percent / 100))) <= 1.1) {
        return true
      }

      return false
    },
    hasEverSuspend(dataList) { // 判断是否有比较长的交易日无法交易（判断停牌等）
      // 尝试一下最大考虑1年的数据
      dataList = lodash.takeRight(dataList, 210)
      if (dataList.length > 1) {
        for(let i=0; i<dataList.length -1; i++) {
          const diff = this.getTradeDaysBetweenTimeRage(dataList[i], dataList[i+1])
          if (diff > 22) {
            return true
          }
        }
      }
      return false
    },
    getStockRepositoryGraph(dataSource, code, collector, base) {
      const dayDiff = this.chooseStock ? 3 : 70 // 填写为70有比较好的模型效果，3是为了快速选股
      const startDays = 10
      const endDays = 70

      const dateList = dataSource.map(item => item.timestamp)
      if (this.hasEverSuspend(dateList)) {
        throw new Error('数据不连续')
      }

      const result = []
      for(let i = dayDiff; i>= 0; i--) {
        // 获取最后 N 天的数据
        let data = lodash.dropRight(dataSource, i)

        if (data.length < endDays) {
          throw new Error('数据量不足')
        }

        const waterFrequencyPercentStart = this.getWaterFrequencyPercentInDays(data, startDays)
        const waterFrequencyPercentEnd = this.getWaterFrequencyPercentInDays(data, endDays)
        const timestamp = data[data.length - 1].timestamp
        result.push({
          code,
          timestamp,
          date: this.dateFormat(timestamp),
          diff: lodash.round((waterFrequencyPercentStart - waterFrequencyPercentEnd) / waterFrequencyPercentEnd * 100, 2),
          last10: waterFrequencyPercentStart,
          last70: waterFrequencyPercentEnd
        })
      }

      let ongoing = null
      let tradeCount = 0
      // 动态规划
      for (let i=0; i<result.length; i++) {
        let current = result[i]
        const price = this.getPrice(dataSource, current.timestamp)
        current.high = price.high
        current.low = price.low
        current.close = price.close
        current.percent = price.percent
        if (this.chooseStock) {
          ongoing = null
        }
        if (!ongoing) {
          if (this.chooseStock || current.diff <= -1 * waterPercentThreshold) { // 选股是输入所有的热度
            tradeCount++
            ongoing = {
              code,
              type: base.type,
              waitByInDate: current.timestamp,
              tradeCount,
              buyInDate: null,
              expectByIn: current.close, // 期待的买入价格
              diff: current.diff,
              last10: current.last10,
              last70: current.last70,
              startSellDate: null,
              expectSellPrice: null,
              actualSellDate: null,
              exception: '',
              waitBuyInDays: '',
              waitSellDays: '',
              holeDays: '',
              profitPercent: ''
            }
            if (this.chooseStock) {
              this.addToCollector(collector, ongoing)
              continue
            }
          }
        } else {
          // 如果准备卖出时，还没有买入，那么交易无效，准备下一次交易

          // 确定卖出时间点
          if (!ongoing.startSellDate) {
            if (current.last10 >= ongoing.last70) {
              ongoing.startSellDate = current.timestamp
              ongoing.expectSellPrice = current.close
              //debugger
            } else if (current.last70 <= -1 * waterPercentThreshold) {
              ongoing.last70 = current.last70
            }
          }

          // 确定买入的时间点
          if (!ongoing.buyInDate) { // 对买入进行修正
            if (this.canByIn(ongoing.expectByIn, current.high, current.low, current.close, current.percent)) {
              ongoing.buyInDate = current.timestamp
            }
          }

          if (ongoing.startSellDate && current.timestamp > ongoing.startSellDate) { // 最早第二天卖
            if (!ongoing.buyInDate || (ongoing.buyInDate > ongoing.startSellDate)) {
              //debugger
              ongoing.exception = `未买入。卖出时间点${ this.dateFormat(ongoing.startSellDate)},买入${ this.dateFormat(ongoing.buyInDate)}`
              this.addToCollector(collector, ongoing)
              ongoing = null
              continue
            } else { // 尝试卖出
              if (ongoing.expectSellPrice > current.low && ongoing.expectSellPrice < current.high) {
                ongoing.actualSellDate = current.timestamp

                //debugger
                ongoing.exception = '成功卖出'
                this.addToCollector(collector, ongoing)
                ongoing = null
                continue
              }
            }
          }
        }
        if (i === result.length - 1) {
          if(ongoing) {
            ongoing.exception = '被套牢'
          }

          this.addToCollector(collector, ongoing)
        }
      }

      if (!this.useChart) {
        return
      }
      this.updateStockRepositoryGraph(result)
    },
    getTradeDaysBetweenTimeRage(start, end) {
      const oneDayMilliSeconds = 24 * 60 * 60 * 1000
      let result = 0
      while(start + oneDayMilliSeconds <= end) {
        start += oneDayMilliSeconds
        if (moment(start).day() === 0 || moment(start).day() === 6) { // 周末不计入交易日
          continue
        }
        result += 1
      }
      return result
    },
    addToCollector(collector, model) {
      if (!model) {
        return
      }
      // 增加额外的值
      let keyList = Object.keys(model)
      keyList.forEach(key => {
        if (key.indexOf('Date') !== -1) {
          model[`${ key }String`] = model[key] ? this.dateFormat(model[key]) : null
        }
      })


      if (model.waitByInDate && model.buyInDate) {
        model.waitBuyInDays = this.getTradeDaysBetweenTimeRage(model.waitByInDate, model.buyInDate)
      }
      if (model.startSellDate && model.actualSellDate) {
        model.waitSellDays = this.getTradeDaysBetweenTimeRage(model.startSellDate, model.actualSellDate)
      }
      if (model.buyInDate && model.actualSellDate) {
        model.holeDays = this.getTradeDaysBetweenTimeRage(model.buyInDate, model.actualSellDate)
      }
      if (model.actualSellDate && model.expectByIn && model.expectSellPrice) {
        model.profitPercent = lodash.round((model.expectSellPrice - model.expectByIn ) / model.expectByIn, 3)
      }

      collector.push(model)
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
          diff: -1 * waterPercentThreshold
        },
        end: {
          timestamp: 'max',
          diff: -1 * waterPercentThreshold
        },
        text: {
          position: 'start',
          content: `-${ waterPercentThreshold }%`
        }
      })
      chart.render();
    },
    analyze() {
      if (!this.useChart) {
        return
      }
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
