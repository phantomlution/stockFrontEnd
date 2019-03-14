/**
 * 针对业务对axios做简单的封装
 */
import axios from 'axios'
import { Message } from 'element-ui'

const axiosInstance = axios.create()
axiosInstance.defaults.timeout = 15 * 1000

// 对后端的返回值进行优化
const showFriendlyErrorMessage = function(response) {
  Message.error({
    message: response
  })
}

const showErrorMessage = function(msg) {
  Message.error({ message: msg })
}


/**
 * 返回的error格式 { message: '' }
 */
const httpInstance = {
  handleResponse(instance, options = {}) {
    const { silent } = options
    return new Promise((resolve, reject) => {
      instance.then(response => {
        let responseData = response.data
        if (!responseData.code) { // 统一后端返回数据结构
          responseData = {
            code: '200',
            data: responseData
          }
        }
        if (['401', '402'].indexOf(responseData.code) !== -1) {
          showErrorMessage('请重新登录')
          reject({ message: '请重新登录' })
        }else if (responseData.code !== '200') {
          showFriendlyErrorMessage(responseData)
          reject({ code: responseData.code, message: responseData.message })
        } else {
          resolve(responseData.data)
        }
      }).catch(err => {
        if (err.code === 'ECONNABORTED') { // 超时
          if (!silent) {
            showErrorMessage('请求超时')
          }
          reject({ message: '请求超时' })
        } else {
          if (err.response) {
            const statusCode = err.response.status
            const responseData = err.response.data || {}
            if (statusCode === 401 || (responseData.code === '010102')) {
              showErrorMessage('请重新登录')
              reject({ message: '请重新登录' })
            } else {
              let errorResponse = ''
              if (statusCode === 500) {
                errorResponse = '网络异常'
              }
              reject({ message: errorResponse })
              if (!silent) {
                errorResponse ? showErrorMessage(errorResponse) : showFriendlyErrorMessage(responseData)
              }
            }
          } else {
            reject({
              message: '网络异常'
            })
          }
        }
      })
    })
  },
  get(url, data, options = {}) {
    let fullOption = Object.assign(options, {
      params: data
    })
    return this.handleResponse(axiosInstance.get(url, fullOption), fullOption)
  },
  post(url, data, options) {
    return this.handleResponse(axiosInstance.post(url, data, options), options)
  },
  put(url, data, options) {
    return this.handleResponse(axiosInstance.put(url, data, options), options)
  },
  delete(url, data, options) {
    let fullOption = Object.assign(options, {
      params: data
    })
    return this.handleResponse(axiosInstance.delete(url, fullOption), fullOption)
  }
}

export const http = httpInstance

export default {
  install(Vue) {
    Vue.prototype.$http = httpInstance
  }
}
