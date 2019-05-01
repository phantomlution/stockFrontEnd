const MAX_REQUEST_QUEUE_LENGTH = 50
const STATE_UPDATE_MILL_SECONDS = 1000

const THREAD_STATE = {
  'PENDING': 0,
  'RUNNING': 1,
  "END": 2
}

export default class {
  constructor(parameterList, getRequest) {
    this.parameterList = parameterList
    this.getRequest = getRequest
    this.state = THREAD_STATE.PENDING
    this.totalCount = parameterList.length
    this.finishCount = 0
    this.requestCount = 0
  }

  run() {
    this.startTime = new Date().getTime()
    this.endTime = null
    this.state = THREAD_STATE.RUNNING
    const interval = setInterval(_ => {
      if (this.requestCount < MAX_REQUEST_QUEUE_LENGTH) {
        const parameter = this.parameterList.pop()
        if (parameter) {
          this.requestCount++
          this.getRequest(parameter).then(_ => {
            this.finishCount++
            this.requestCount--
          }).catch(_ => {
            this.finishCount++
            this.requestCount--
          })
        }

        if (interval && this.totalCount === this.finishCount) {
          this.state = THREAD_STATE.END
          this.endTime = new Date().getTime()
          clearInterval(interval)
        }
      }
    }, 0)
  }

  getStateModel() {
    const model = {
      totalCount: this.totalCount,
      finishCount: this.finishCount,
      requestCount: this.requestCount
    }
    if (this.endTime === null) {
      model.seconds = this.getSeconds(this.startTime, new Date().getTime())
    } else {
      model.seconds = this.getSeconds(this.startTime, this.endTime)
    }
    return model
  }

  getSeconds(startTime, endTime) {
    return parseInt((endTime - startTime) / 1000)
  }

  on({ sync, done }) {
    let interval = setInterval(_ => {
      if (this.state === THREAD_STATE.END) {
        if (interval) {
          clearInterval(interval)
          interval = null
          if (done) {
            done(this.getStateModel())
          }
        }
      }
      if (this.state === THREAD_STATE.RUNNING) {
        if (sync) {
          sync(this.getStateModel())
        }
      }
    }, STATE_UPDATE_MILL_SECONDS)
  }

}
