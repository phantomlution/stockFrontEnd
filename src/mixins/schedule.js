/**
 * 简化定时器任务调度
 */

/**
 * 股票相关的调度策略
 * @constructor
 */
export const STOP_CALLBACK_FOR_STOCK = function() {
  const date = new Date()
  const day = date.getDay()
  if (day === 0 || day === 6) {
    return true
  }
  if (date.getHours() >= 15) {
    return true
  }
  return false
}

export default {
  data() {
    return {
      defaultScheduler: null,
      componentDestroyed: false
    }
  },
  beforeDestroy() {
    this.componentDestroyed = true
    this.stopSchedule()
  },
  methods: {
    /**
     * @param executedFunc
     *    被调用函数
     * @param interval
     *    间隔
     * @param stopCallback
     *    自动终止调度回调
     */
    startSchedule(executedFunc, seconds, stopCallback) {
      this.stopSchedule()
      if (!this.componentDestroyed) {
        executedFunc.call()
      }
      this.defaultScheduler = setInterval(_ => {
        if (this.componentDestroyed) { // 防止延迟启动后，不销毁的问题
          this.stopSchedule()
          return
        }
        if (stopCallback !== undefined && stopCallback.call()) {
          this.stopSchedule()
          return
        }
        executedFunc.call()
      }, 1000 * seconds)
    },
    stopSchedule() {
      if (this.defaultScheduler) {
        clearInterval(this.defaultScheduler)
        this.defaultScheduler = null
      }
    }
  }
}
