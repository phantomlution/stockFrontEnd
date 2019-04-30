export const apiMap = {
  getCodeList: `/api/stock/list`
}

export default {
  install(Vue) {
    Vue.prototype.$api = apiMap
  }
}
