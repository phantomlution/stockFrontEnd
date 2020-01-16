<template>
  <lr-box style="min-height: 420px" v-loading="isLoading">
    <div slot="title">
      <lr-stock-detail-link :add="showAdd" :code="code" :name="name" />
      <span style="display: inline-block; font-size: 14px;margin-left: 8px">
        近一个月成交额: {{ average }} million
      </span>
    </div>
    <k-line ref="chart" @dblclick="dblclick" />
  </lr-box>
</template>

<script>
import lodash from 'lodash'

const props = {
  code: {
    type: String,
    default: ''
  },
  showAdd: {
    type: Boolean,
    default: true
  }
}
export default {
  props,
  data() {
    return {
      name: '',
      average: '',
      isLoading: false
    }
  },
  watch: {
    code() {
      this.updateChart()
    }
  },
  beforeDestroy(){
    this.$bus.$off('surgeForShortChanged')
  },
  mounted() {
    this.updateChart()
    this.$bus.$on('surgeForShortChanged', code => {
      this.loadSurgeForShort(code)
    })
  },
  methods: {
    updateChart() {
      const code = this.code
      if (!code) {
        return
      }
      this.isLoading = true
      Promise.all([
        this.$store.dispatch('loadStockData', code),
      ]).then(stockList => {
        this.loadSurgeForShort(code).then(_ => {
          this.isLoading = false
        }).catch(_ => {
          this.isLoading = false
          console.error(_)
        })
      }).catch(_ => {
        this.isLoading = false
        console.error(_)
      })
    },
    loadSurgeForShort(code) {
      const stock = this.$store.state.data.stockMap.get(code)
      return new Promise((resolve, reject) => {
        // 分析数据点个数
        const historyItemList = lodash.takeRight(stock.rawData, 200)
        const dateList = historyItemList.map(item => item.date)
        this.$http.put(`/api/analyze/surgeForShort/batch`, {
          code,
          dateList
        }).then(_ => {
          stock.surgeForShortList = _.filter(item => !!item.time)
          if (code === this.code) {
            this.renderChart({
              stock,
            })
          }

          resolve()
        }).catch(_ => {
          console.error(_)
          reject(_)
        })
      })
    },
    calculateAmount(data) {
      this.average = ''
      const recentDataList = lodash.takeRight(data, 30)
      // 计算最近一个自然月的平均成交量
      const average = lodash.round(lodash.mean(recentDataList.map(item => item.amountInMillion)), 2)
      this.average = average
    },
    renderChart({stock}) {
      let rawData = stock.result
      this.stock = stock
      console.log(stock)
      this.code = stock.code
      this.name = stock.name
      const data = lodash.takeRight(rawData, 200)
      const dateList = data.map(item => item.date)
      this.calculateAmount(data)

      // 聚合其他数据
      this.mergeData(stock, data, dateList).then(_ => {
        this.$refs.chart.renderChart(data, {
          type: stock.type,
          assistantLine: this.getAssistantLine(stock)
        })
      }).catch(_ => {
        console.error(_)
        this.$message.error('数据加载失败，请重试')
      })
    },
    mergeData(stock, dataList, dateList) {
      return new Promise((resolve, reject) => {
        if (stock.type === 'concept') {
          this.getConceptRank(stock.name, dateList).then(rankResult => {
            dataList.forEach(item => {
              const rankItem = rankResult.find(rankItem => rankItem.date === item.date)
              if (rankItem) {
                item.rank = rankItem.rank
                item.rankWeight = rankItem.rankWeight
              }
            })
            resolve()
          }).catch(_ => {
            reject(_)
          })
        } else {
          resolve()
        }
      })
    },
    getAssistantLine(stock) {

//      view.line().position('timestamp*close').color('#4FAAEB').tooltip('close*percent').size(2)

      // 拉高出货点
      const surgeForShortList = stock.surgeForShortList || []
      // 追加限售解禁信息
      const restrictSellList = stock.base.restrict_sell_list || []
      // 追加高亮点
      const highlightPointList = [] //this.config ? this.config.highlight || [] : []

      // TODO 添加涨停，跌停到辅助线中 ？？

      const pointList = []
      Array.prototype.push.apply(pointList, surgeForShortList.map(item => ({ date: item.date, text: '拉高出货' })))
      Array.prototype.push.apply(pointList, restrictSellList.map(item => ({ date: item.date, text: '解禁' })))
      Array.prototype.push.apply(pointList, highlightPointList.map(item => ({ date: item.date, text: '当前点' })))

      const groupResult = lodash.groupBy(pointList, item => item.date)
      const assistantLineList = []
      Object.keys(groupResult).forEach(date => {
        const position = {
          start: [date, 'min'],
          end: [date, 'max']
        }

        assistantLineList.push({
          position,
          content: groupResult[date].map(item => item.text)
        })
      })

      return assistantLineList
    },
    getConceptRank(conceptName, dateList) { // 获取概念在指定日期内的排行
      return new Promise((resolve, reject) => {
        this.$http.put(`/api/data/concept/ranking`, {
          dateList
        }).then(rankingList => {
          const result = []
          rankingList.forEach(rankingItem => {
            const date = rankingItem.date
            const ranking = rankingItem.ranking
            const totalCount = ranking.length

            const conceptIndex = ranking.findIndex(item => item.name === conceptName)
            if (conceptIndex !== -1) {
              console.log(ranking[conceptIndex])
              result.push({
                date,
                rankWeight: totalCount - conceptIndex,
                rank: `${ conceptIndex + 1 }/${totalCount}`
              })
            }
          })
          resolve(result)
        }).catch(_ => {
          reject(_)
        })
      })
    },
    dblclick(item) {
      this.$emit('dblclick', item)
    }
  }
}
</script>
