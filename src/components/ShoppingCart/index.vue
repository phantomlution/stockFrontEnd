<template>
  <el-popover width="480" trigger="manual" v-model="dialogVisible">
    <div v-loading="loading" v-if="formModel">
      <p>
        <el-form :model="formModel" ref="form" label-width="84px">
          <el-form-item label="关注" prop="payAttention">
            <el-checkbox v-model="formModel.payAttention" />
          </el-form-item>
          <el-form-item label="分析" prop="desc">
            <div style="display: flex">
              <el-input v-model="formModel.desc" placeholder="选择理由" style="flex: 1" />
            </div>
          </el-form-item>
          <el-form-item label="价格≤" prop="notification.price.value" :rules="[{validator: conditionValidator, trigger: 'blur'}]">
            <div style="display: flex;">
              <div style="flex: 1">
                <el-input v-model="formModel.notification.price.value" />
              </div>
            </div>
          </el-form-item>
          <el-form-item label="换手率≥" prop="notification.turnOverRate.value" :rules="[{validator: conditionValidator, trigger: 'blur'}]">
            <div style="display: flex">
              <div style="flex: 1">
                <el-input v-model="formModel.notification.turnOverRate.value">
                  <span slot="append">%</span>
                </el-input>
              </div>
            </div>
          </el-form-item>
          <el-form-item label="跌幅≥" prop="notification.slump.value" :rules="[{validator: conditionValidator, trigger: 'blur'}]">
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
    <el-link slot="reference" @click.stop="dialogVisible=true">{{ buttonText }}</el-link>
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
  buttonText: {
    type: String,
    default: '加自选'
  }
}

const defaultFormModel = {
  desc: '',
  payAttention: false,
  notification: {
    'price': {
      value: ''
    },
    'turnOverRate': {
      value: ''
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
      model.conditionList = Object.keys(this.formModel.notification).filter(conditionKey => this.formModel.notification[conditionKey].value.length > 0).map(conditionKey => {
        return {
          key: conditionKey,
          value: this.formModel.notification[conditionKey].value
        }
      })

      this.$store.dispatch('addToStockPool', model).then(_ => {
        this.dialogVisible = false
        this.$bus.$emit(this.eventKey, model)
      }).catch(_ => {
      })
    },
    conditionValidator(rule, val='', callback) {
      if (val.length === 0) {
        return callback()
      }
      if (isNaN(val)) {
        return callback('请输入正确的数字')
      }
      return callback()
    }
  }
}
</script>
