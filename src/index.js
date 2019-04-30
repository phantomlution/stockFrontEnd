// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import ElementUI from 'element-ui'
import SlothUI from './components'
import 'element-ui/lib/theme-chalk/index.css'
import http from './utils/http'
import excel from './utils/excel'
import api from '@/api'
console.log(api)
Vue.config.productionTip = false

Vue.use(ElementUI, {
  size: 'mini'
})

Vue.use(SlothUI)
Vue.use(http)
Vue.use(excel)
Vue.use(api)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: { App },
  template: '<App/>'
})
