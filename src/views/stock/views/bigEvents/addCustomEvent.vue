<template>
  <div>
    <div style="text-align: right">
      <el-button type="primary" @click.stop="openDialog">添加自定义事件</el-button>
    </div>
    <el-dialog :visible.sync="dialogVisible" title="自定义事件" width="489px">
      <el-form :model="formModel" ref="form" label-width="100px">
        <el-form-item label="事件名称" prop="name" :rules="[ { required: true }]">
          <el-input v-model.trim="formModel.name"/>
        </el-form-item>
        <el-form-item label="时间节点" prop="date" :rules="[ { required: true } ]">
          <el-date-picker v-model="formModel.date" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期">
          </el-date-picker>
        </el-form-item>
      </el-form>
      <div style="text-align: right">
        <el-button @click.stop="cancelDialog">取消</el-button>
        <el-button type="primary" @click.stop="saveItem">保存</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      dialogVisible: false,
      formModel: {
        name: '',
        date: []
      }
    }
  },
  methods: {
    openDialog() {
      this.$refs.form && this.$refs.form.resetFields()
      this.dialogVisible = true
    },
    cancelDialog() {
      this.dialogVisible = false
    },
    saveItem() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.$http.post(`/api/event/calendar/`, {
            title: this.formModel.name,
            start: this.$moment(this.formModel.date[0]).format('YYYY-MM-DD'),
            end: this.$moment(this.formModel.date[1]).format('YYYY-MM-DD'),
            isImportant: true
          }).then(_ => {
            this.$message.success('保存成功')
            this.dialogVisible = false
            this.$emit('change')
          }).catch(_ => {
            console.error(_)
          })
        }
      })
    }
  }
}
</script>
