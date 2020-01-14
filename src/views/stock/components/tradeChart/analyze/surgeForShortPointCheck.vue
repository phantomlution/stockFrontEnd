<template>
  <div v-show="showItem" class="lr-surge-for-short__result">
    <span class="lr-surge-for-short__result">
      <template v-if="hasPoint">
        <el-link :underline="false" type="success">有</el-link>
        <el-tag>{{ timePoint }}</el-tag>
      </template>
      <template v-else>
        <el-link :underline="false" type="info">无</el-link>
      </template>
    </span>
    <el-popover trigger="manual" placement="top-end" width="250" v-model="dialogVisible">
      <div>
        <el-form :model="model.formModel" label-width="64px" v-if="model && model.formModel" style="margin-top: 8px;margin-bottom: -16px">
          <el-form-item label="时间点">
            <div style="display: flex">
              <div style="flex: 1">
                <el-input v-model="model.formModel.time" readOnly placeholder="请从图表中双击选取" />
              </div>
              <el-button type="text" @click.stop="model.formModel.time = ''" style="margin-left: 8px;">清除</el-button>
            </div>
          </el-form-item>
          <el-form-item label="确认">
            <el-switch v-model="model.formModel.check"></el-switch>
          </el-form-item>
        </el-form>
      </div>
      <div style="display: flex;align-items: center;padding-top: 16px">
        <div style="flex: 1">
          <el-checkbox v-model="autoMode">自动模式</el-checkbox>
        </div>
        <div>
          <el-button size="mini" type="text" @click.stop="closeDialog">取消</el-button>
          <el-button type="primary" size="mini" @click.stop="confirmPoint">确定</el-button>
        </div>
      </div>

      <el-button :type="color" @click.stop="dialogVisible = !dialogVisible" slot="reference">{{ label }}</el-button>
    </el-popover>
  </div>
</template>

<script>
const props = {
  visible: { // 外部容器的可见状态
    type: Boolean,
    default: true
  },
  hasItem: {
    type: Boolean,
    default: false
  }
}

export default {
  props,
  data() {
    return {
      dialogVisible: false,
      hideItem: false,
      autoMode: true,
      realCheckState: false,
      model: null
    }
  },
  computed: {
    timePoint() {
      if (this.model && this.model.formModel && this.model.formModel.time) {
        return this.model.formModel.time
      }
      return ''
    },
    hasPoint() {
      return !!this.timePoint
    },
    label() {
      if (this.realCheckState) {
        return '已确认'
      }
      return '未确认'
    },
    color() {
      if (this.realCheckState) {
        return 'success'
      }
      return 'info'
    },
    showItem() {
      return !this.hideItem && this.hasItem
    }
  },
  watch: {
    visible(val) {
      if (!val) {
        this.closeDialog()
      }
    },
    autoMode(val) {
      if (val) {
        if (this.model && this.model.formModel) {
          this.model.formModel.check = true
        }
      }
    }
  },
  methods: {
    setTime(code, date, time) {
      if (this.model && this.model.code === code && this.model.date === date) {
        if (this.model.formModel) {
          this.model.formModel.time = time
        }
      }
    },
    load(code, date) {
      this.loadSurgeForShort(code, date)
    },
    loadSurgeForShort(code, date) { // 加载数据
      const model = {
        date,
        code,
        formModel: null
      }
      this.model = model
      this.realCheckState = false

      const today = this.$moment().format('YYYY-MM-DD')
      if (today === date) { // 当天数据
        if (new Date().getHours() < 18) { // 18点之前未生成，无法确认
          this.hideItem = true
          return
        }
      } else {
        if (this.$moment(date).isAfter(this.$moment(today))) { // 未来的数据，无法确认
          this.hideItem = true
          return
        }
      }

      this.hideItem = false

      this.$http.get(`/api/analyze/surgeForShort`, {
        code,
        date
      }).then(_ => {
        model.formModel = {
          "id": _._id,
          "code": code,
          "date": date,
          'time': _.time,
          "check": _.check,
          'desc': _.desc,
        }
        this.realCheckState = _.check

        if (this.autoMode) { // 自动模式
          model.formModel.check = true
        }
      }).catch(_ => {
        console.error(_)
      })
    },
    confirmPoint() {
      const formModel = this.model.formModel
      if (!formModel) {
        return
      }
      this.$http.put(`/api/analyze/surgeForShort`, formModel).then(_ => {
        this.realCheckState = true
        this.$message.success('更新成功')
//        this.closeDialog()
      }).catch(_ => {
        console.error(_)
      })
    },
    closeDialog() {
      this.dialogVisible = false
    }
  }
}
</script>

<style lang="scss">
.lr-surge-for-short__result{
  display: flex;
  align-items: center;
  .el-link{
    margin-right: 8px;
  }
  .el-tag{
    margin-right: 8px;
  }
}
</style>
