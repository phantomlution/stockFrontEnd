import Vue from 'vue'
import Vuex from 'vuex'
import data from './data'
import option from './option'
import suspendTradeDate from './suspendTradeDate'
import stockPool from './stockPool'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    data,
    stockPool, // 股票自选池
    suspendTradeDate,
    option // 期权
  }
})
