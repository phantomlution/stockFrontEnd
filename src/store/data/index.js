export default {
  state: {
    stockMap: new Map(), // 股票数据
    codeList: [],
    marketHeat: [],
    lowPriceCount: [],
    secondPhaseMap: new Map()
  },
  mutations: {
    updateData(state, { key, data }) {
      state[key] = data
    }
  },
  actions: {
    updateData(context, config) {
      context.commit('updateData', config)
    }
  }
}
