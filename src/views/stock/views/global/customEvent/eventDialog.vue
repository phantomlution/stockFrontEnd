<template>
  <el-drawer title="事件列表" size="75%" :visible.sync="visible" direction="ltr">
    <div>
      <el-tag size="small" v-for="event of eventList" :key="event._id" @click.stop="loadEventDetail(event._id)">{{ event.name }}</el-tag>
    </div>
    <div>
      <el-row :gutter="32" v-if="current">
        <el-col :span="12">
          <el-form :model="current" label-width="64px" ref="form">
            <el-form-item label="名称" prop="name" :rules="[ { required: true }]">
              <el-input v-model="current.name" />
            </el-form-item>
            <el-form-item label="内容">
              <lr-editor v-model="current.content" />
            </el-form-item>
          </el-form>
          <div style="text-align: right">
            <el-button type="primary" @click.stop="updateEvent">更新</el-button>
          </div>
        </el-col>
        <el-col :span="12">
          <item-list :list="current.item_list" />
        </el-col>
      </el-row>
    </div>
  </el-drawer>
</template>

<script>
import itemList from './item/list.vue'

export default {
  components: {
    itemList
  },
  data() {
    return {
      visible: false,
      eventList: [],
      current: null
    }
  },
  watch: {
    visible(val) {
      if(val && this.eventList.length === 0) {
        this.loadEventList()
      }
    }
  },
  beforeDestroy() {
    this.$bus.$off('openEventPanel')
  },
  mounted() {
    this.$bus.$on('openEventPanel', _ => {
      this.visible = true
    })
  },
  methods: {
    loadEventList() {
      this.$http.get(`/api/event/custom/list`).then(_ => {
        this.eventList = _
      }).catch(_ => {
        console.error(_)
      })
    },
    loadEventDetail(eventId) {
      this.$http.get(`/api/event/custom?event_id=${ eventId }`).then(_ => {
        _.item_list.forEach(item => {
          item.datetime = this.$moment(item.time).format('YYYY-MM-DD HH:mm')
        })
        console.log(_)
        this.current = _
      }).catch(_ => {
        console.error(_)
      })
    },
    updateEvent() {
      this.$refs.form.validate(valid => {
        if (valid) {
          const current = this.current
          const model = {
            "_id": current._id,
            "name": current.name,
            "content": current.content
          }
          this.$http.put('/api/event/custom', model).then(_ => {
            this.$message.success('更新成功')
          }).catch(_ => {
            console.error(_)
          })
        }
      })
    }
  }
}
</script>
