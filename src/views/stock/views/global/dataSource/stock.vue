<template>
  <div style="display: flex">
    <div>
      <el-progress type="circle" :percentage="percentage" :status="status"></el-progress>
    </div>
    <div style="flex: 1;margin-left: 32px;">
      <div style="display: flex;height: 100%;flex-direction: column">
        <div style="color: rgba(0, 0, 0, 0.65);display: flex;align-items: center;flex: 1">
          交易数据
          <span v-if="total">
            (共<span style="color: red">{{ total }}</span>条)
          </span>
        </div>
        <div style="height: 54px;">
          <el-button type="primary" @click.stop="syncStockData">{{ buttonLabel }}</el-button>
          <el-radio-group v-model="dataSetType" style="margin-left: 32px">
            <el-radio-button label="full">全量数据</el-radio-button>
            <el-radio-button label="part">测试数据</el-radio-button>
          </el-radio-group>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import RequestThread from '@/utils/RequestThread'
import lodash from 'lodash'

export default {
  data() {
    return {
      percentage: 0,
      total: 0,
      dataSetType: 'full',
      loadingState: 0, // 1: 进行中
    }
  },
  computed: {
    status() {
      if(this.percentage === 100) {
        return 'success'
      }
      return null
    },
    stockMap() {
      return this.$store.state.data.stockMap
    },
    buttonLabel() {
      if (this.loadingState === 0) {
        return '开始同步'
      }
      return '同步中...'
    }
  },
  methods: {
    loadDependency() { // 加载依赖数据
      return new Promise((resolve, reject) => {
        const stockCodeList = this.$store.state.data.codeList
        if (stockCodeList.length === 0) {
          this.$message.error('数据未初始化')
          return reject('数据未初始化')
        }
        resolve({
          stockList: stockCodeList
        })
      })
    },
    updateProgress(state) {
      if (state.totalCount === 0) {
        return 0
      }
      this.percentage = Math.round(state.finishCount / state.totalCount * 100)
    },
    syncStockData() {
      this.loadDependency().then(({ stockList }) => {
        if (this.loadingState !== 0) {
          return this.$message.warning('当前正在同步中')
        }

        this.updateState('')
        const currentType = this.dataSetType
        if (currentType === 'part') { // 部分同步
          stockList = stockList.filter((item, itemIndex) => itemIndex < 100)
        }

        // reset
        this.percentage = 0
        this.loadingState = 1
        this.total = stockList.length

        const needLoadCodeList = stockList.map(item => item.value)
        const requestThread = new RequestThread(needLoadCodeList, _ => this.loadStockData(_))

        this.stockMap.clear()

        requestThread.on({
          sync: state => { // 同步状态
            this.updateProgress(state)
          },
          done: state => { // 任务结束
            this.updateProgress(state)
            this.loadingState = 0
            if (currentType === 'part') {
              this.updateState('warning')
            } else {
              this.updateState('success')
            }
          }
        })
        requestThread.run()
      })
    },
    loadStockData(code) {
      return this.$store.dispatch('loadStockData', code)
    },
    updateState(state) {
      this.$emit('change', state)
    }

  }
}
</script>
