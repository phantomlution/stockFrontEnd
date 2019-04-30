<template>
  <el-popover v-model="dialogVisible">
    <div>
      <slot />
      <div style="text-align: right" v-if="showFooter">
        <el-button @click.stop="cancelAdd">取消</el-button>
        <el-button type="primary" @click.stop="confirmAdd">确定</el-button>
      </div>
    </div>
    <el-button slot="reference" type="primary">{{ buttonName }}</el-button>
  </el-popover>
</template>

<script>
/**
 * edit form via button
 */

const props = {
  buttonName: {
    type: String,
    required: true
  },
  visible: {
    type: Boolean,
    default: false
  },
  showFooter: {
    type: Boolean,
    default: true
  }
}
export default {
  name: 'LrButtonForm',
  props,
  data() {
    return {
      dialogVisible: false
    }
  },
  watch: {
    visible(val) {
      this.dialogVisible = val
    },
    dialogVisible(val) {
      this.$emit('update:visible', val)
    }
  },
  methods: {
    getForm() {
      if (this.$slots.default && this.$slots.default[0]) {
        return this.$slots.default[0].componentInstance
      }
      return null
    },
    closeDialog() {
      this.dialogVisible = false
    },
    cancelAdd() {
      const form = this.getForm()
      form && form.resetFields && form.resetFields()
      this.closeDialog()
    },
    confirmAdd() {
      const form = this.getForm()
      if (form && form.validate) {
        form.validate(valid => {
          if (valid) {
            this.$emit('confirm')
          }
        })
      }
    }
  }
}
</script>
