/**
 * Created by yixiaoxiao on 2020/1/2.
 *
 * 本地数据存储
 */
import { $moment } from '@/utils'

const storage = {
  local: window.localStorage
}

const localStorage = {
  set(key, value, expires=-1) {
    if (expires !== -1) {
      expires = $moment(expires).toDate().getTime()
    }
    const model = {
      expires,
      value
    }
    storage.local.setItem(key, JSON.stringify(model))
  },
  get(key) {
    const historyItem = storage.local.getItem(key)

    if (!historyItem) {
      return null
    } else {
      const model = JSON.parse(historyItem)
      const expires = model.expires
      if (expires === -1) {
        return model.value
      } else if (expires >= new Date().getTime()) {
        return model.value
      } else {
        return null
      }
    }
  }
}


export default {
  install(Vue) {
    Vue.prototype.$local = localStorage
  }
}
