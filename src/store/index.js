import Vue from 'vue'
import Vuex from 'vuex'
import data from './data'
import option from './option'
import suspendTradeDate from './suspendTradeDate'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    data,
    suspendTradeDate,
    option // 期权
  }
})
