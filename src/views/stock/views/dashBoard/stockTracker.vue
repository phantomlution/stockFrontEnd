<template>
  <div>
    <el-card :style="cardStyle">
      <div slot="header">
        <span>
          <lr-stock-detail-link :code="code" :name="name" addText="设置" />
        </span>
        <span style="float: right;margin-left: 8px;margin-top: 1px" @click.stop="removeItem">
          <el-link icon="el-icon-close" />
        </span>
        <span style="float: right; margin: 3px 0;" v-if="biding">
          <lr-number-tag :amount="biding.currentDiff">
            <span slot="prepend">
              {{ biding.current || '-' }}
            </span>
          </lr-number-tag>
          <span style="font-size: 12px;font-weight: bold">
            {{ biding.volume | volume }},{{ biding.turnOverRate }}%
          </span>
        </span>
      </div>
      <div v-if="biding">
        <el-form>
          <el-row>
            <el-col :span="12">
              <el-form-item label="今开">
                {{ biding.open}}
                <lr-number-tag :amount="biding.openDiff" ></lr-number-tag>
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
                <lr-number-tag :amount="biding.maxDiff" ></lr-number-tag>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="最低">
                {{ biding.min || '-' }}
                <lr-number-tag :amount="biding.minDiff" ></lr-number-tag>
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

const props = {
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  item: { // 整个配置信息
    type: Object,
    required: true
  }
}

const default_interval = 30
const attention_interval = 5

export default {
  props,
  data(){
    return {
      tracker: null,
      eventKey: `STOCK_POOL_UPDATE_${ this.code }`,
      stockPoolItem: this.item,
      interval: default_interval,
      lastUpdate: -1,
      biding: null,
      notificationList: [],
      defaultConditionList: [
        {
          key: 'slump',
          value: '-5',
          enabled: true
        }
      ]
    }
  },
  computed: {
    cardStyle() {
      if (this.stockPoolItem.payAttention) {
        return {
          background: '#fdf6ec'
        }
      }
      return {

      }
    }
  },
  watch: {
    'stockPoolItem.payAttention'() {
      this.updateTrackSpeed()
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
    this.updateTrackSpeed()
    this.$bus.$on(this.eventKey, newItem => {
      this.$set(this, 'stockPoolItem', newItem)
      this.initTracker()
    })
    this.initTracker()
  },
  beforeDestroy() {
    this.$bus.$off(this.eventKey)
    this.stopTracker()
  },
  methods: {
    initTracker() {
      this.stopTracker()
      this.startTracker()
      this.loadDetail()
    },
    stopTracker() {
      if (this.tracker) {
        clearInterval(this.tracker)
        this.tracker = null
      }
    },
    updateTrackSpeed() {
      const val = this.stockPoolItem.payAttention || false
      if (!val) {
        this.interval = default_interval
      } else {
        this.interval = attention_interval
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
        response.maxDiff = this.calculateDiff(response, 'max')
        response.minDiff = this.calculateDiff(response, 'min')
        response.openDiff = this.calculateDiff(response, 'open')
        response.currentDiff = this.calculateDiff(response, 'current')

        this.biding = response
        this.lastUpdate = new Date().getTime()

        this.checkNotification(response)
      }).catch(_ => {
        console.error(_)
      })
    },
    removeItem() {
      this.$fastConfirm().then(_ => {
        this.$emit('removeItem')
      })
    },
    calculateDiff(biding, fieldName, target='yesterday') {
      return lodash.round((biding[fieldName] - biding[target]) * 100 / biding[target], 2)
    },
    checkNotification(biding) { // 开启内容推送
      const code = this.code
      const name = this.name

      const conditionList = []
      Array.prototype.push.apply(conditionList, this.defaultConditionList)
      Array.prototype.push.apply(conditionList, this.stockPoolItem.conditionList || [])

      // 所有数据应该考虑实时的值，和历史的值
      const priceConditionItem = conditionList.filter(item => item.key === 'price')


      conditionList.forEach(condition => {
        let notificationItem = {
          code,
          name,
          condition
        }

        if (condition.key === 'price') {
          if (biding.current <= Number(condition.value)) {
            this.addNotification(notificationItem)
          } else if (biding.min <= Number(condition.value)) {
            notificationItem.title = `${ notificationItem.name } 最低值`
            this.addNotification(notificationItem)
          }
        } else if (condition.key === 'volume') {
          if (biding[condition.key] >= Number(condition.value)) {
            this.addNotification(notificationItem)
          }
        } else if (condition.key === 'slump') {
          if (Number(biding.currentDiff) <= Number(condition.value)) {
            this.addNotification(notificationItem)
          }
        }
      })
    },
    addNotification({ code, name, condition, title }) {
      const oldItem = this.notificationList.find(item => item.code === code && item.condition.key === condition.key)
      if (!oldItem) {
        // 加入消息队列
        this.notificationList.push({
          code,
          name,
          condition
        })

        setTimeout(_ => {
          // 弹出通知
          this.$notify({
            title: title ? title : `${ this.$moment().format('HH:mm')} ${ name } ${ condition.key }`,
            message: `${ condition.value }`,
            duration: 0,
            type: 'warning'
          })
        }, 0)
      }
    }
  }

}
</script>
