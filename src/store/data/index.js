import blackList from './blackList'
import { http } from '@/utils/http'
import { Message } from 'element-ui'
import Stock from '@/utils/stock'
import { $moment } from '@/utils'
import lodash from 'lodash'

export default {
  state: {
    blackList, // 黑名单
    stockMap: new Map(), // 股票数据
    searchOptionList: [],
    codeList: [],
    marketHeat: [],
    lowPriceCount: [],
    stockHeatRank: {}, // 热度榜
    tradeDateList: [], // 交易日列表
    marketPriceMap: new Map(), // 市场价格
  },
  getters: {
    searchOptionList: state => state.searchOptionList
  },
  mutations: {
    updateData(state, { key, data }) {
      state[key] = data
    }
  },
  actions: {
    updateData(context, config) {
      context.commit('updateData', config)
    },
    loadStockData(context, code) {
      const stockMap = context.state.stockMap
      return new Promise((resolve, reject) => {
        if (stockMap.has(code)) { // 缓存中读取数据
          const stock = stockMap.get(code)
          return resolve(stock)
        }

        Promise.all([
          http.get('/api/data/base', { code }),
          http.get(`/api/data/kline`, { code })
        ]).then(responseList => {
          if (!responseList[0]) {
            throw new Error('找不到该数据')
          }
          const base = responseList[0]
          const source = responseList[1]

          const stock = new Stock(base, source)
          stockMap.set(code, stock)
          resolve(stockMap.get(code))
        }).catch(_ => {
          console.log(_)
          reject(_)
        })
      })
    },
    getStockCodeList(context) {
      return new Promise((resolve, reject) => {
        http.get('/api/stock/list').then(list => {
          const result = []
          list.forEach(item => {
            result.push({
              label: item.name,
              value: item.code
            })
          })
          context.state.codeList = result
          resolve(result)
        }).catch(_ => {
          reject(_)
        })
      })
    },
    getConceptBlock() { // 获取概念板块数据
      return new Promise((resolve, reject) => {
        http.get('/api/data/block/concept').then(result => {
          resolve(result)
        }).catch(_ => {
          reject(_)
        })
      })
    },
    getRecentTradeDateList(context) {
      return new Promise((resolve, reject) => {
        http.get(`/api/data/recent/market/open`).then(result => {
          context.state.tradeDateList = result
          resolve()
        }).catch(_ => {
          reject(_)
        })
      })
    },
    getThemeList() {
      return http.get(`/api/stock/theme/market`)
    },
    loadSearchOptionList(context) {
      return new Promise((resolve, reject) => {
        http.get(`/api/data/search/option`).then(list => {
          context.state.searchOptionList = list
          resolve()
        }).catch(_ => {
          reject(_)
        })
      })
    },
    loadStockHeatRank(context) { // 生成热度榜
      return new Promise((resolve, reject) => {
        http.get(`/api/analyze/heat/report`).then(_ => {
          _ = lodash.sortBy(_, item => -1 * item.count / item.total)

          const upperRank = []
          let currentRank = []
          let currentRatio = 1
          _.forEach(item => {
            const ratio = lodash.round(item.count / item.total, 4)
            if (ratio < currentRatio) {
              Array.prototype.push.apply(upperRank, currentRank)
              currentRank = [item]
              currentRatio = ratio
            } else {
              currentRank.push(item)
            }

            item.rank = upperRank.length + 1
          })

          // 生成热度榜
          _.forEach(item => {
            context.state.stockHeatRank[item.code] = item
          })
          resolve()
        }).catch(_ => {
          console.error(_)
        })
      })
    },
    getStockHeatRank(context, code) {
      return context.state.stockHeatRank[code]
    }
  }
}
