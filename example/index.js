// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import ElementUI from 'element-ui'
import SlothUI from './components'
import 'element-ui/lib/theme-chalk/index.css'

Vue.config.productionTip = false


import DummyRed		from './dummy/DummyRed.vue'
import DummyGreen	from './dummy/DummyGreen.vue'
import DummyBlue	from './dummy/DummyBlue.vue'

Vue.component(DummyRed.name, DummyRed)
Vue.component(DummyGreen.name, DummyGreen)
Vue.component(DummyBlue.name, DummyBlue)

Vue.use(ElementUI, {
  size: 'mini'
})

Vue.use(SlothUI)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  components: { App },
  template: '<App/>'
})
