import upperFirst from 'lodash/upperFirst'
import camelCase from 'lodash/camelCase'
const context = require.context('./', true, /\.vue$/)

export default {
  install(Vue) {
    context.keys().forEach(fileName => {
      const componentConfig = context(fileName)
      const component = componentConfig.default || componentConfig

      const componentName = upperFirst(
        camelCase(
          component.name.replace(/^\.\/(.*)\.\w+$/, '$1')
        )
      )

      Vue.component(componentName, component)
    })
  }
}
