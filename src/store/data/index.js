export default {
  state: {
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
