<template>
  <div class="lr-stock-tracker">
    <div class="lr-stock-tracker--tag">
      <div style="flex: 1">
        <template v-if="stockPoolItem.threePhase">
          <el-tag effect="dark" type="danger">③</el-tag>
        </template>
        <template v-if="stockPoolItem.isReducing">
          <el-tag effect="dark" type="danger">减</el-tag>
        </template>
        <template v-if="stockPoolItem.weight && stockPoolItem.weight > 0">
          <el-tag effect="dark" type="primary">{{ stockPoolItem.weight }}x</el-tag>
        </template>
      </div>
    </div>
    <el-card :style="cardStyle">
      <div slot="header">
        <lr-stock-detail-link :code="code" :name="name" icon="el-icon-setting" :detectType="false" />
        <span style="float: right;margin-left: 8px;margin-top: 1px" @click.stop="removeItem">
          <el-link icon="el-icon-close" />
        </span>
        <span style="float: right; margin: 3px 0;" v-if="statModel">
          <lr-number-tag :amount="statModel.priceDiff">
            <span slot="prepend">
              {{ statModel.price | price }}
            </span>
          </lr-number-tag>
          <span style="font-size: 12px;font-weight: bold">
            {{ statModel.amount | amount }}({{ statModel.amountPercent }}%)
          </span>
        </span>
      </div>
      <div>
        <real-time-deal v-if="dependency" :code="dependency.secid" :name="name" :height="realTimeDealHeight" :lightMode="true" :duration="interval" :yesterdayClose="dependency.yesterdayClose" :yesterdayAmount="dependency.yesterdayAmount" :live="true" @statChange="updateStatInfo"></real-time-deal>
      </div>
    </el-card>
  </div>
</template>

<script>
import lodash from 'lodash'
import { deepClone} from '@/utils'
import realTimeDeal from '@/views/stock/components/realTimeDeal.vue'

const props = {
  name: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  yesterday: {
    type: Date,
    default: null
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
  components: {
    realTimeDeal
  },
  data(){
    return {
      realTimeDealHeight: 160,
      eventKey: `STOCK_POOL_UPDATE_${ this.code }`,
      stockPoolItem: this.item,
      interval: default_interval,
      statModel: null,
      defaultNotificationList: [],
      customNotificationList: [],
      defaultConditionList: [
        {
          key: 'slump',
          value: '3',
          unit: '%'
        },
        {
          key: 'surge',
          value: '5',
          unit: '%'
        },
      ],
      dependency: null,
    }
  },
  computed: {
    cardStyle() {
      if (this.stockPoolItem.payAttention) {
        return {
          background: '#fdf6ec'
        }
      }
      return {}
    },
    isIndex() { // 是否为指数
      return ['上证指数'].indexOf(this.name) !== -1
    }
  },
  watch: {
    'stockPoolItem.payAttention'() {
      this.updateTrackSpeed()
    },
    yesterday() {
      this.loadYesterdayData()
    }
  },
  mounted() {
    this.updateTrackSpeed()
    this.$bus.$on(this.eventKey, newItem => {
      this.$set(this, 'stockPoolItem', newItem)
    })
    this.loadYesterdayData()
  },
  beforeDestroy() {
    this.$bus.$off(this.eventKey)
  },
  methods: {
    updateTrackSpeed() {
      const val = this.stockPoolItem.payAttention || false
      if (!val) {
        this.interval = default_interval
      } else {
        this.interval = attention_interval
      }
    },
    loadYesterdayData() {
      if (!this.yesterday) {
        return
      }
      const date = this.$moment(this.yesterday).format('YYYY-MM-DD')
      this.$store.dispatch('loadStockData', this.code).then(stockItem => {
        const yesterday = stockItem.rawData.find(item => item.date === date)

        this.dependency = {
          secid: stockItem.base.secid,
          yesterdayClose: yesterday.close,
          yesterdayAmount: yesterday.amount
        }
      }).catch(_ => {
        console.error(_)
      })
    },
    removeItem() {
      this.$fastConfirm().then(_ => {
        this.$store.dispatch('removeStockPoolItem', this.code)
      })
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
    updateStatInfo(statModel) {
      this.statModel = statModel
      if (statModel) {
        this.checkAllNotification(statModel)
      }
    },
    checkConditionItem(biding, notificationSource, condition) {
      // 所有数据应该考虑实时的值，和历史的值
      if (condition.key === 'price') {
        if (biding.price <= Number(condition.value)) {
          this.addNotification(notificationSource, condition)
        }
        if (biding.min <= Number(condition.value)) { // 判断历史
          this.addNotification(notificationSource, condition, true)
        }
      } else if (condition.key === 'amount') {
        if (biding[condition.key] >= Number(condition.value)) {
          this.addNotification(notificationSource, condition)
        }
      } else if (condition.key === 'slump') { // 判断历史
        let slumpValue = -1 * Math.abs(Number(condition.value))
        if (Number(biding.priceDiff) <= slumpValue) {
          this.addNotification(notificationSource, condition)
        }
        if (Number(biding.minDiff) <= slumpValue) {
          this.addNotification(notificationSource, condition, true)
        }
      } else if(condition.key === 'surge') {
        let surgeValue = Math.abs(Number(condition.value))
        if (Number(biding.priceDiff) >= surgeValue) {
          this.addNotification(notificationSource, condition)
        }
        if (Number(biding.maxDiff) >= surgeValue) {
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
            message: `${ condition.value } ${ condition.unit ? condition.unit : ''}`,
            duration: 0,
            type: 'warning'
          })
        }, 0)
      }
    }
  }

}
</script>

<style lang="scss">
.lr-stock-tracker{
  position: relative;
  .lr-stock-tracker--tag{
    position: absolute;
    top: 44px;
    left: 0;
    display: flex;
    width: 100%;
    box-sizing: border-box;
    padding: 0 16px;
  }
  .el-card__header{
    padding: 16px;
  }
  .el-card__body{
    padding: 8px;
    background: #FFFFFF;
  }
}


</style>
