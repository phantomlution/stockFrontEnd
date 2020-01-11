<template>
  <div>
    <el-form ref="form" :model="formModel" label-width="100px">
      <el-form-item label="事件类型">
        <el-radio-group v-model="formModel.type" >
          <el-radio-button label="custom">自定义</el-radio-button>
          <el-radio-button label="stock">股票</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="时间" prop="time" :rules="[ { required: true }]">
        <el-date-picker type="datetime" v-model="formModel.time" ></el-date-picker>
      </el-form-item>
      <el-form-item label="股票代码" prop="stockCode" v-if="formModel.type === 'stock'" :rules="[ { required: true }]">
        <item-search v-model="formModel.stockCode"/>
      </el-form-item>
      <el-form-item label="事件名称" prop="eventId" :rules="[ { required: true, message: '请选择相关事件' } ]" v-if="formModel.type === 'custom'">
        <div style="display: flex">
          <div style="flex: 1">
            <el-select v-model="formModel.eventId" style="width: 100%">
              <el-option v-for="item of eventList" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </div>
          <div style="margin-left: 8px;">
            <el-popover v-model="eventFormVisible" placement="top">
              <div style="width: 240px">
                <el-form :model="eventFormModel" label-width="64px" ref="eventForm">
                  <el-form-item label="名称" prop="name" :rules="[ { required: true } ]">
                    <el-input v-model="eventFormModel.name" />
                  </el-form-item>
                </el-form>
                <div style="text-align: right">
                  <el-button type="text" @click.stop="closeEventFormAdd">取消</el-button>
                  <el-button type="primary" @click.stop="saveEvent">保存</el-button>
                </div>
              </div>
              <el-button type="primary" slot="reference">新建</el-button>
            </el-popover>

          </div>
        </div>
      </el-form-item>
      <el-form-item label="内容" prop="content" :rules="[ { required: true, message: '请填写内容' } ]">
        <!--<el-input v-model="formModel.content" />-->
        <lr-editor v-model="formModel.content"/>
      </el-form-item>
      <el-form-item label="链接" prop="url">
        <el-input v-model="formModel.url" />
      </el-form-item>
    </el-form>
    <div style="text-align: right">
      <el-button type="text" @click.stop="close">取消</el-button>
      <el-button type="primary" @click.stop="saveItem">保存</el-button>
    </div>
  </div>
</template>

<script>
import itemSearch from '@/views/stock/components/itemSearch'

export default {
  components: {
    itemSearch
  },
  data() {
    return {
      eventFormVisible: false,
      eventFormModel: {
        name: ''
      },
      formModel: {
        type: 'custom',
        stockCode: '',
        eventId: '',
        time: '',
        content: '',
        url: ''
      },
      eventList: []
    }
  },
  methods: {
    doInit(model) {
      return Promise.all([
        this.loadCustomEventList()
      ]).then(responseList => {
        this.eventList = responseList[0]
        this.formModel.content = model.content || ''
        this.formModel.url = model.url || ''
        if (model.time) {
          this.formModel.time = this.$moment(model.time).toDate().getTime()
        }
      })
    },
    loadCustomEventList() {
      return this.$http.get(`/api/event/custom/list`).then(eventList => {
        return eventList.map(item => {
          return {
            label: item.name,
            value: item._id
          }
        })
      })
    },
    saveEvent() {
      this.$refs.eventForm.validate(valid => {
        if (valid) {
          const model = {
            name: this.eventFormModel.name
          }
          this.$http.post(`/api/event/custom/save`, model).then(_ => {
            this.eventList.push({
              label: model.name,
              value: _
            })
            this.$message.success("保存成功")
            this.closeEventFormAdd()
            this.formModel.eventId = _
          }).catch(_ => {
            console.error(_)
          })
        }
      })
    },
    closeEventFormAdd() {
      this.eventFormVisible = false
      this.$refs.eventForm.resetFields()
    },
    saveItem() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const model = {
            type: this.formModel.type,
            stockCode: this.formModel.stockCode,
            eventId: this.formModel.eventId,
            time: this.$moment(this.formModel.time).toDate().getTime(),
            content: this.formModel.content,
            url: this.formModel.url
          }

          this.$http.post(`/api/event/custom/item/save`, model).then(_ => {
            this.$message.success('保存成功')
            this.close()
          }).catch(_ => {
            console.error(_)
          })
        }
      })
    },
    close() {
      this.$emit('close')
    }
  }
}
</script>
