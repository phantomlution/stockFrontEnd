import blackList from './blackList'

export default {
  state: {
    blackList, // 黑名单
    stockMap: new Map(), // 股票数据
    codeList: [],
    marketHeat: [],
    lowPriceCount: [],
    secondPhaseMap: new Map(),
    marketPriceMap: new Map(), // 市场价格
    stockThemeList: [], // 股票 -> 主题
    themeMap: new Map() // 主题 -> 股票
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
