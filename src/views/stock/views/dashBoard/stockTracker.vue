<template>
  <div>
    <el-card>
      <div slot="header">
        <span>
          <lr-stock-detail-link :code="code" :name="name" />
        </span>
        <span style="float: right;margin-left: 8px;margin-top: 1px" @click.stop="removeItem">
          <el-link icon="el-icon-close" />
        </span>
        <span :style="priceStyle" style="float: right; margin: 3px 0;">
          {{ biding.current || '-' }}&nbsp;&nbsp;&nbsp;{{ increment}}
        </span>
      </div>
      <div>
        <el-form>
          <el-row>
            <el-col :span="8">
              <el-form-item label="最高">{{ biding.max || '-' }}</el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="最低">{{ biding.min || '-' }}</el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="成交量">{{ biding.volume | volume }}</el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="8">
              <el-form-item label="卖一">{{ sellOne }}</el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="买一">{{ buyOne }}</el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script>
import lodash from 'lodash'

const props = {
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  }
}

export default {
  props,
  data(){
    return {
      tracker: null,
      interval: 30,
      lastUpdate: -1,
      biding: {},
    }
  },
  computed: {
    buyOne() {
      if (!this.biding.biding) {
        return '-'
      }
      return this.biding.biding[5][1]
    },
    sellOne() {
      if (!this.biding.biding) {
        return '-'
      }
      return this.biding.biding[4][1]
    },
    priceTrend() { // 控制股价颜色, 1代表涨，0不变，-1 跌
      if (this.biding.current) {
        if (this.biding.current !== this.biding.yesterday) {
          return this.biding.current - this.biding.yesterday > 0 ? 1 : -1
        }
      }
      return 0
    },
    priceStyle() {
      if (this.priceTrend === 0) {
        return {
          color: 'grey'
        }
      } else if (this.priceTrend === 1) {
        return {
          color: 'red'
        }
      } else if (this.priceTrend === -1) {
        return {
          color: 'green'
        }
      }
    },
    increment() {
      if (!this.biding.current) {
        return '-'
      }
      return `${ lodash.round((this.biding.current - this.biding.yesterday) * 100 / this.biding.yesterday ,2)}%`
    }
  },
  filters: {
    volume(val) {
      if (!val) {
        return '-'
      }
      return `${ lodash.round(val / 10000, 2)}万手`
    }
  },
  mounted() {
    this.loadDetail()
    this.stopTracker()
    // 分流所有的请求
    setTimeout(_ => {
      this.startTracker()
    }, Math.random() * 30 * 1000)
  },
  beforeDestroy() {
    this.stopTracker()
  },
  methods: {
    stopTracker() {
      if (this.tracker) {
        clearInterval(this.tracker)
        this.tracker = null
      }
    },
    startTracker() {
      this.tracker = setInterval(_ => {
        const hour = new Date().getHours()
        if (hour >= 15) {
          this.stopTracker()
          return
        }
        this.loadDetail()
      }, 1000 * this.interval)
    },
    loadDetail() {
      const code = this.code
      this.$http.get(`/api/stock/detail/biding`, { code }).then(response => {
        this.biding = response
        this.lastUpdate = new Date().getTime()
      }).catch(_ => {
        console.error(_)
      })
    },
    removeItem() {
      this.$fastConfirm().then(_ => {
        this.$emit('removeItem')
      })
    }
  }

}
</script>
