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
      defaultNotificationList: [],
      customNotificationList: [],
      defaultConditionList: [
        {
          key: 'slump',
          value: '-5',
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
        const day = new Date().getDay()
        if (day === 6 || day === 7 || hour >= 16) {
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

        this.checkAllNotification(response)
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
    checkAllNotification(biding) {
      // 默认消息
      this.checkConditionList(biding, this.defaultNotificationList, this.defaultConditionList)
      this.checkConditionList(biding, this.customNotificationList, this.stockPoolItem.conditionList || [])
    },
    checkConditionList(biding, notificationSource, conditionList) { // 开启内容推送
      conditionList.forEach(conditionItem => {
        this.checkConditionItem(biding, notificationSource, conditionItem)
      })
    },
    checkConditionItem(biding, notificationSource, condition) {
      // 所有数据应该考虑实时的值，和历史的值
      if (condition.key === 'price') {

        if (biding.current <= Number(condition.value)) {
          this.addNotification(notificationSource, condition)
        }
        if (biding.min <= Number(condition.value)) { // 判断历史
          this.addNotification(notificationSource, condition, true)
        }
      } else if (condition.key === 'volume') {
        if (biding[condition.key] >= Number(condition.value)) {
          this.addNotification(notificationSource, condition)
        }
      } else if (condition.key === 'slump') { // 判断历史
        if (Number(biding.currentDiff) <= Number(condition.value)) {
          this.addNotification(notificationSource, condition)
        }
        if (Number(biding.minDiff) <= Number(condition.value)) {
          this.addNotification(notificationSource, condition, true)
        }
      }

    },
    addNotification(notificationSource, conditionItem, history=false) {
      const condition = {
        history,
        ...conditionItem
      }
      const oldItem = notificationSource.find(item => item.key === condition.key && item.history === condition.history && item.value === condition.value)
      if (!oldItem) {
        // 加入消息队列
        notificationSource.push(condition)

        setTimeout(_ => {
          // 弹出通知
          this.$notify({
            title: `${ condition.history ? '前期数据' : this.$moment().format('HH:mm')} ${ this.name } ${ condition.key }`,
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
