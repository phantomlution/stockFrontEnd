import blackList from './blackList'
import { http } from '@/utils/http'
import { Message } from 'element-ui'
import Stock from '@/utils/stock'
import { $moment } from '@/utils'

export default {
  state: {
    blackList, // 黑名单
    stockMap: new Map(), // 股票数据
    searchOptionList: [],
    codeList: [],
    marketHeat: [],
    lowPriceCount: [],
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
          http.get(`/api/stock/detail`, { code })
        ]).then(responseList => {
          if (!responseList[0]) {
            throw new Error('找不到该数据')
          }
          const base = responseList[0]['base']
          const source = responseList[0]['data']

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
    }
  }
}
