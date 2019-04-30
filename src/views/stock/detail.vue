<template>
  <div style="overflow: auto">
    <div>
      <lr-box>
        <el-input-number v-model="analyzeModel.dataCount" :step="50" :min="70" />
        <el-button type="primary" @click.stop="downloadExcel">分析</el-button>
        <el-button type="primary" @click.stop="startBash">启动脚本</el-button>
        <el-select v-model="analyzeModel.code" filterable :filter-method="throttleSearch" v-show="true">
          <el-option v-for="item in analyzeModel.currentCodeList" :key="item.value" :label="`(${ item.label}) ${ item.value }`" :value="item.value"></el-option>
        </el-select>
        <el-button @click.stop="refresh">刷新</el-button>
      </lr-box>
      <lr-box>
        <el-form label-width="84px">
          <el-form-item label="更新视图">
            <el-switch v-model="useChart" />
          </el-form-item>
          <el-form-item :label="'近' + calculateNilDays + '日做空'" >
            <el-switch v-model="hasNil" />
          </el-form-item>
        </el-form>
      </lr-box>
      <lr-box style="margin-top: 8px" v-show="choiceList.length > 0">
        <el-tag class="lr-stock-tag" size="medium" closable @close="removeChoice(itemIndex)" v-for="(item, itemIndex) of choiceList" :key="itemIndex" @click.stop="analyzeChoice(item.value)">{{ item.label }}</el-tag>
      </lr-box>
      <lr-box :title="analyzeModel.title">
        <div :id="chartId"></div>
      </lr-box>
      <lr-box>
        <div :id="secondChartId"></div>
      </lr-box>
    </div>
  </div>
</template>

<script>
import G2 from '@antv/g2'
import { idGenerator, deepClone } from '@/utils'
import lodash from 'lodash'
import moment from 'moment'
import stockUtils from '@/utils/stockUtils'
import Stock from '@/utils/stock'
import RequestThread from '@/utils/RequestThread'

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
      calculateNilDays: 3,
      choiceList: [], // 待选择列表
      analyzeModel: {
        recentRecordCount: 3,
        maxOutputStockCount: 48,
        codeList: [],
        currentCodeList: [],
        title: '',
        code: '',
        dataCount: 70,
        base: null,
        source: []
      }
    }
  },
  computed: {
    hasNil() {
      if (this.analyzeModel.source.length > 0) {
        return lodash.takeRight(this.analyzeModel.source, this.calculateNilDays).filter(item => item.percent <= -5).length > 0
      }
      return false
    }
  },
  watch: {
    'analyzeModel.dataCount'() {
      this.analyze()
    },
    'analyzeModel.code'() {
      this.refresh()
    }
  },
  mounted() {
    this.$nextTick(_ => {
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
    analyzeChoice(code) {
      this.analyzeModel.code = code
    },
    refresh() {
      this.loadData(this.analyzeModel.code)
    },
    removeChoice(index) {
      this.choiceList.splice(index, 1)
    },
    startBash() {
      this.collector = []
      this.choiceList = []
      let stockList = this.analyzeModel.codeList
      const needLoadCodeList = stockList.map(item => item.value)

      const requestThread = new RequestThread(needLoadCodeList, _ => this.loadData(_, true))
      requestThread.run()
      requestThread.sync(state => { // 同步状态
        console.log(state)
      })
    },
    loadStockList() {
      stockUtils.getCodeList().then(codeList => {
        this.analyzeModel.codeList = codeList
        this.filterStockItem()
      }).catch(_ => {
        console.error(_)
      })
    },
    loadData(code, chooseStock = false) {
      const collector = this.collector
      if (!code) {
        return Promise.reject('no code represent')
      }
      return Promise.all([
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
        this.analyzeModel.title = base.name
        this.analyzeModel.source = data
        this.analyze()
      }).catch(_ => {
        console.log(_)
      })
    },
    filterStockItem(query) {
      if (!query) {
        this.analyzeModel.currentCodeList = lodash.take(this.analyzeModel.codeList, 10)
        return
      }
      this.analyzeModel.currentCodeList = lodash.take(this.analyzeModel.codeList.filter(item => {
        return item.label.indexOf(query) !== -1 || item.value.indexOf(query) !== -1
      }), 10)
    },
    getBase() {
      return this.analyzeModel.base
    },

    downloadExcel() {
      if (this.collector.length === 0) {
        return this.$message.error('没有要导出的数据')
      }

      let collectorData = deepClone(this.collector)
      collectorData.sort((former, later) => {
        return former.diff - later.diff
      })

      const analyzeResult = []
      let targetData = lodash.take(collectorData, this.analyzeModel.recentRecordCount * this.analyzeModel.maxOutputStockCount)
      targetData.forEach(item => {
        if (!analyzeResult.find(existItem => item.code === existItem.code)) {
          if (analyzeResult.length < this.analyzeModel.maxOutputStockCount) {
            analyzeResult.push(item)
          }
        }
      })

      this.choiceList = analyzeResult.map(item => {
        return {
          label: `(${ item.diff })${ item.name }`,
          value: item.code
        }
      })
    },

    getStockRepositoryGraph({dataSource, code, chooseStock}) {
      const stock = new Stock(code, dataSource)
      stock.getComputedData().then(result => {
        if (!this.useChart) {
          return
        }
        this.updateStockRepositoryGraph(result)
      }).catch(_ => {
        console.error(_)
      })
    },

    addToCollector(collector, model) {
      if (!model) {
        return
      }
      // 增加额外的值
      let keyList = Object.keys(model)
      keyList.forEach(key => {
        if (key.indexOf('Date') !== -1) {
          model[`${ key }String`] = model[key] ? stockUtils.dateFormat(model[key]) : null
        }
      })

      collector.push(model)
    },
    updateStockRepositoryGraph(data) {
      data = lodash.takeRight(data, this.analyzeModel.dataCount)
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

      const guide = {
        average,
        waterFrequencyPercent
      }
      this.updateChart(data, guide)
      this.getStockRepositoryGraph({
        dataSource: data,
        code: base.symbol,
        collector: this.collector,
        base,
      })
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

<style lang="scss">
.lr-stock-tag{
  &:hover{
    cursor: pointer;
  }
}

.el-tag{
  margin-bottom: 8px;
  margin-right: 8px;
}
</style>
