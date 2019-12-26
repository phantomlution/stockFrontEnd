/**
 * 股票池数据
 */
import { http } from '@/utils/http'
import { Message } from 'element-ui'

export default {
  state: {
    stockPoolList: [], // 自选股票池
  },
  getters: {
    stockPoolList: state => state.stockPoolList
  },
  actions: {
    addToStockPool(context, model) { // 加入自选池
      return new Promise((resolve, reject) => {
        http.post('/api/stock/pool', model).then(_ => {
          context.dispatch('getStockPoolList').then(poolList => { // 更新自选池
            Message.success('操作成功')
            resolve()
          }).catch(err => {
            reject(err)
          })
        }).catch(_ => {
          reject(_)
        })
      })
    },
    getStockPoolList(context) {
      return http.get(`/api/stock/pool`).then(_ => {
        context.state.stockPoolList = _
      }).catch(_ => {
        console.log(_)
      })
    },
    removeStockPoolItem(context, code) {
      return new Promise((resolve, reject) => {
        http.delete('/api/stock/pool', { code }).then(_ => {
          context.dispatch('getStockPoolList').then(poolList => { // 更新自选池
            Message.success('操作成功')
            resolve()
          }).catch(err => {
            reject(err)
          })
        }).catch(_ => {
          reject(_)
        })
      })
    }
  }
}
