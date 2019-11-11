<template>
  <div>
    <el-form ref="form" :model="formModel" label-width="100px">
      <el-form-item label="事件类型">
        <el-radio-group v-model="formModel.type" >
          <el-radio-button label="custom">自定义</el-radio-button>
          <el-radio-button label="stock">股票</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="股票代码" prop="stockCode" v-if="formModel.type === 'stock'" :rules="[ { required: true }]">
        <search-stock v-model="formModel.stockCode"/>
      </el-form-item>
      <el-form-item label="事件名称" prop="eventId" :rules="[ { required: true, message: '请选择相关事件' } ]" v-if="formModel.type === 'custom'">
        <div style="display: flex">
          <div style="flex: 1">
            <el-select v-model="formModel.eventId">
              <el-option v-for="item of eventList" :key="item.value" :label="item.label" :value="item.value"></el-option>
            </el-select>
          </div>
          <div>
            <el-popover v-model="eventFormVisible">
              <div>
                <el-form :model="eventFormModel" ref="eventForm">
                  <el-form-item label="名称" prop="name" :rules="[ { required: true } ]">
                    <el-input v-model="eventFormModel.name" />
                  </el-form-item>
                </el-form>
                <div>
                  <el-button @click.stop="saveEvent">保存</el-button>
                </div>
              </div>
              <el-button type="primary" slot="reference">新建</el-button>
            </el-popover>

          </div>
        </div>
      </el-form-item>
      <el-form-item label="时间" prop="time" :rules="[ { required: true }]">
        <el-date-picker type="datetime" v-model="formModel.time" ></el-date-picker>
      </el-form-item>
      <el-form-item label="内容" prop="content" :rules="[ { required: true, message: '请填写内容' } ]">
        <el-input v-model="formModel.content" />
      </el-form-item>
      <el-form-item label="链接" prop="url">
        <el-input v-model="formModel.url" />
      </el-form-item>
    </el-form>
    <div>
      <el-button type="primary" @click.stop="saveItem">保存</el-button>
    </div>
  </div>
</template>

<script>
import searchStock from '@/views/stock/components/searchStock'

export default {
  components: {
    searchStock
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
            this.eventFormVisible = false
            this.formModel.eventId = _
          }).catch(_ => {
            console.error(_)
          })
        }
      })
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
            this.$emit('close')
          }).catch(_ => {
            console.error(_)
          })
        }
      })

    }
  }
}
</script>
