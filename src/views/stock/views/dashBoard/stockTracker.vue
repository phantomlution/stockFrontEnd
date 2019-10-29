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
            {{ biding.volume | volume }},{{ biding.turnOverRate }}%
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
      notificationList: []
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
        if (code === 'SZ002927') {
          const conditionList = [
            {
              key: 'price',
              value: '19.60',
              enabled: true
            }
          ]
          this.checkNotification({
            code,
            name: this.name,
            conditionList,
            biding: response
          })
        }
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
    },
    checkNotification({ code, name, conditionList, biding }) { // 开启内容推送
      conditionList.filter(item => item.enabled).forEach(condition => {
        let notificationItem = {
          code,
          name,
          condition
        }
        if (condition.key === 'price') {
          if (biding.current <= Number(condition.value)) {
            this.addNotification(notificationItem)
          }
        } else if (condition.key === 'volume' || condition.key === 'turnOverRate') {
          if (biding[condition.key] >= Number(condition.value)) {
            this.addNotification(notificationItem)
          }
        }
      })
    },
    addNotification({ code, name, condition }) {
      const oldItem = this.notificationList.find(item => item.code === code && item.condition.key === condition.key)
      if (!oldItem) {
        // 弹出通知
        this.$notify({
          title: name,
          message: `${ this.$moment().format('HH:MM')} 满足 ${ condition.key }: ${ condition.value }`,
          duration: 0,
          type: 'warning'
        })
        // 加入消息队列
        this.notificationList.push({
          code,
          name,
          condition
        })
      }
    }
  }

}
</script>
