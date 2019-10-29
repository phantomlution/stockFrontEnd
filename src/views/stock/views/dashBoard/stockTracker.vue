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
        <span style="float: right; margin: 3px 0;">
          <stock-percent-tag :percentage="currentDiff">
            <span slot="prepend">
              {{ biding.current || '-' }}
            </span>
          </stock-percent-tag>
          <span style="font-size: 12px;font-weight: bold">
            {{ biding.volume | volume }}
          </span>
        </span>
      </div>
      <div>
        <el-form>
          <el-row>
            <el-col :span="12">
              <el-form-item label="今开">
                {{ biding.open}}
                <stock-percent-tag :percentage="openDiff" ></stock-percent-tag>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="昨收">{{ biding.yesterday }}</el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="最高">
                {{ biding.max || '-' }}
                <stock-percent-tag :percentage="maxDiff" ></stock-percent-tag>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="最低">
                {{ biding.min || '-' }}
                <stock-percent-tag :percentage="minDiff" ></stock-percent-tag>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script>
import lodash from 'lodash'
import stockPercentTag from './stockPercentTag.vue'

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
  components: {
    stockPercentTag
  },
  data(){
    return {
      tracker: null,
      interval: 30,
      lastUpdate: -1,
      biding: {},
    }
  },
  computed: {
    maxDiff() {
      return this.calculateDiff('max')
    },
    minDiff() {
      return this.calculateDiff('min')
    },
    openDiff() {
      return this.calculateDiff('open')
    },
    currentDiff() {
      return this.calculateDiff('current')
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
    this.startTracker()
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
    },
    calculateDiff(fieldName, target='yesterday') {
      let result = ''
      if (this.biding[target]) {
        result = lodash.round((this.biding[fieldName] - this.biding[target]) * 100 / this.biding[target], 2).toString()
      }
      if (result.length === 0) {
        return '-'
      } else {
        return `${result}`
      }
    }
  }

}
</script>
