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
import socket from '@/socket'
import eventBus from '@/plugins/eventBus'
import VueGoodTablePlugin from 'vue-good-table'
import store from './store'

import 'vue-good-table/dist/vue-good-table.css'

Vue.config.productionTip = false

Vue.use(ElementUI, {
  size: 'mini'
})

Vue.use(SlothUI)
Vue.use(http)
Vue.use(excel)
Vue.use(api)
Vue.use(VueGoodTablePlugin)

Vue.use(socket)
Vue.use(eventBus)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  components: { App },
  template: '<App/>'
})
