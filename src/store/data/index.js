import blackList from './blackList'
import { http } from '@/utils/http'
import { Message } from 'element-ui'
import Stock from '@/utils/stock'
import moment from 'moment'

export default {
  state: {
    blackList, // 黑名单
    stockMap: new Map(), // 股票数据
    codeList: [],
    marketHeat: [],
    lowPriceCount: [],
    marketPriceMap: new Map(), // 市场价格
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
        if (!code) {
          return reject('code is empty')
        }

        if (stockMap.has(code)) { // 缓存中读取数据
          const stock = stockMap.get(code)
          return resolve(stock)
        }

        return Promise.all([
          http.get(`/api/stock/detail`, { code })
        ]).then(responseList => {
          if (!responseList[0]) {
            throw new Error('找不到该数据')
          }
          const base = responseList[0]['base']
          const source = responseList[0]['data']

          const stockName = base.name.toUpperCase()

          if (stockName.indexOf('债') !== -1) {
            throw new Error('跳过债券')
          }

          // 重新格式化数据

          const rawData = source.data.map(item => {
            let model = Object.create(null)
            for(let i=0; i<source.column.length; i++) {
              let column = source.column[i]
              model[column] = item[i]
            }
            // 强制转换日期格式
            model.timestamp = moment(model.date).toDate().getTime()

            return model
          })

          if (rawData.length < this.historyDataCount / 2) {
            throw new Error('数据不足')
          }
          const stock = new Stock(base, rawData)
          stockMap.set(code, stock)
          resolve(stock)
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
    }
  }
}
