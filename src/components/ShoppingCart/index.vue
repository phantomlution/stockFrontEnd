<template>
  <el-popover width="480" trigger="manual" v-model="dialogVisible">
    <div v-loading="loading" v-if="formModel">
      <p>
        <el-form :model="formModel" ref="form" label-width="84px">
          <el-row>
            <el-col :span="8">
              <el-form-item label="关注" prop="payAttention">
                <el-checkbox v-model="formModel.payAttention" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="三阶段" prop="threePhase">
                <el-checkbox v-model="formModel.threePhase" />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="减持" prop="isReducing">
                <el-checkbox v-model="formModel.isReducing" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="分析" prop="desc">
            <div style="display: flex">
              <el-input v-model="formModel.desc" placeholder="选择理由" style="flex: 1" />
            </div>
          </el-form-item>
          <el-form-item label="价格≤" prop="notification.price.value" :rules="[{validator: conditionValidator, trigger: 'blur'}, {validator: positiveNumberValidator, trigger: 'blur'} ]">
            <div style="display: flex;">
              <div style="flex: 1">
                <el-input v-model="formModel.notification.price.value" />
              </div>
            </div>
          </el-form-item>
          <el-form-item label="成交额≥" prop="notification.amount.value" :rules="[{validator: conditionValidator, trigger: 'blur'}, {validator: positiveNumberValidator, trigger: 'blur'} ]">
            <div style="display: flex">
              <div style="flex: 1">
                <el-input v-model="formModel.notification.amount.value">
                  <span slot="append">Million</span>
                </el-input>
              </div>
            </div>
          </el-form-item>
          <el-form-item label="跌幅≥" prop="notification.slump.value" :rules="[{validator: conditionValidator, trigger: 'blur'}, {validator: positiveNumberValidator, trigger: 'blur'} ]">
            <div style="display: flex">
              <div style="flex: 1">
                <el-input v-model="formModel.notification.slump.value" >
                  <span slot="append">%</span>
                </el-input>
              </div>
            </div>
          </el-form-item>
        </el-form>
      </p>
      <div style="text-align: right; margin: 0">
        <el-button size="mini" type="text" @click.stop="dialogVisible=false">取消</el-button>
        <el-button type="primary" size="mini" @click.stop="addToStockPool">确定</el-button>
      </div>
    </div>
    <el-link type="info" slot="reference" :underline="false" @click.stop="dialogVisible=true"><i :class="icon" /></el-link>
  </el-popover>
</template>

<script>
import { deepClone } from '@/utils'
// 加入自选池

const props = {
  code: {
    type: String,
    required: true
  },
  temp: {
    type: Boolean,
    default: true
  },
  icon: {
    type: String,
    default: 'el-icon-circle-plus'
  }
}

const defaultFormModel = {
  desc: '',
  payAttention: false,
  threePhase: false,
  isReducing: false, // 是否减持中
  notification: {
    'price': {
      value: ''
    },
    'amount': {
      value: '',
      unit: 'Million'
    },
    'slump': {
      value: ''
    }
  }
}

export default {
  name: 'LrShoppingCart',
  props,
  data() {
    return {
      oldModel: null,
      formModel: null,
      eventKey: `STOCK_POOL_UPDATE_${ this.code }`,
      dialogVisible: false,
      loading: true
    }
  },
  watch: {
    code() {
      this.dialogVisible = false
      this.$refs.form && this.$refs.form.clearValidate()
    },
    dialogVisible(val) {
      if (val) {
        this.loadHistoryData()
      }
    },
  },
  methods: {
    loadHistoryData() {
      this.formModel = deepClone(defaultFormModel)
      this.oldModel = null
      this.loading = true
      const code = this.code
      this.$http.get(`/api/stock/pool/item`, { code }).then(_ => {
        if (_) {
          this.oldModel = _
          this.formModel.desc = _.desc || ''
          this.formModel.payAttention = _.payAttention || false
          this.formModel.threePhase = _.threePhase || false
          this.formModel.isReducing = _.isReducing || false

          if (_.conditionList) {
            Object.keys(this.formModel.notification).forEach(conditionKey => {
              const condition = _.conditionList.find(item => item.key === conditionKey)
              if (condition) {
                this.formModel.notification[conditionKey].value = condition['value'] + ''
              }
            })
          }
        }

        this.loading = false
      }).catch(_ => {
        this.dialogVisible = false
        console.error(_)
      })
    },
    addToStockPool() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.saveStockPoolItem()
        }
      })
    },
    saveStockPoolItem() {
      let model = this.oldModel
      if (!this.model) {
        model = {
          code: this.code,
          temp: this.temp
        }
      }

      model['desc'] = this.formModel.desc
      model['payAttention'] = this.formModel.payAttention
      model['threePhase'] = this.formModel.threePhase
      model['isReducing'] = this.formModel.isReducing
      model.conditionList = Object.keys(this.formModel.notification).filter(conditionKey => this.formModel.notification[conditionKey].value.length > 0).map(conditionKey => {
        return {
          key: conditionKey,
          value: this.formModel.notification[conditionKey].value,
          unit: this.formModel.notification[conditionKey].unit || ''
        }
      })

      this.$store.dispatch('addToStockPool', model).then(_ => {
        this.dialogVisible = false
        this.$bus.$emit(this.eventKey, model)
      }).catch(_ => {
        console.error(_)
      })
    },
    conditionValidator(rule, val='', callback) {
      if (val.length === 0) {
        return callback()
      }
      if (isNaN(val)) {
        return callback('请输入数字')
      }
      return callback()
    },
    positiveNumberValidator(rule, val = '', callback) {
      if (val.length === 0) {
        return callback()
      }
      if (isNaN(val)) {
        return callback('请输入数字')
      }
      if (Number(val) < 0) {
        return callback('不能小于零')
      }
      return callback()
    }
  }
}
</script>
