
const excelUtils = {
  export({ data, name = 'default' }) {
  }
}

export default {
  install(Vue) {
    Vue.prototype.$excel = excelUtils
  }
}
