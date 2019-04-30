const MAX_REQUEST_QUEUE_LENGTH = 200
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
  }

  run() {
    this.startTime = new Date().getTime()
    this.state = THREAD_STATE.RUNNING
    let requestCount = 0
    const interval = setInterval(_ => {
      if (requestCount < MAX_REQUEST_QUEUE_LENGTH) {
        const parameter = this.parameterList.pop()
        if (parameter) {
          requestCount++
          this.getRequest(parameter).then(_ => {
            this.finishCount++
            requestCount--
          }).catch(_ => {
            this.finishCount++
            requestCount--
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
    return {
      totalCount: this.totalCount,
      finishCount: this.finishCount
    }
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
