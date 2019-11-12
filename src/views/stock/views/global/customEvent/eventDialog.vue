<template>
  <div>
    <div>
      <el-tag size="small" v-for="event of eventList" :key="event._id" @click.stop="loadEventDetail(event._id)">{{ event.name }}</el-tag>
    </div>
    <div>
      <el-row :gutter="32" v-if="current">
        <el-col :span="12">
          <el-form label-width="64px">
            <el-form-item label="名称">
              <el-input v-model="current.name" />
            </el-form-item>
            <el-form-item label="内容">
              <lr-editor v-model="current.content" />
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="12">
          <item-list :list="current.item_list" />
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import itemList from './item/list.vue'

export default {
  components: {
    itemList
  },
  data() {
    return {
      eventList: [],
      current: null
    }
  },
  mounted() {
    this.loadEventList()
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
    }
  }
}
</script>
