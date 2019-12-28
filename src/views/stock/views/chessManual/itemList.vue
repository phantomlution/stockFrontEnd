<template>
  <div>
    <div v-if="isHistory" style="padding-bottom: 24px">
      <el-divider><span style="color: #909399">以下为历史数据</span></el-divider>
    </div>
    <el-timeline class="lr-pretty">
      <el-timeline-item :timestamp="item.date" placement="top" v-for="item of itemList" :key="item.date">
        <item :item="item" />
      </el-timeline-item>
    </el-timeline>

    <div v-if="isHistory" style="padding: 8px 16px">
      <!-- 加载更多 -->
      <el-button type="primary" size="small" @click.stop="loadData" style="width: 100%">加载更多</el-button>
    </div>
  </div>
</template>

<script>
import item from './item.vue'

const props = {
  isHistory: { // 默认加载最近七天数据
    type: Boolean,
    default: false
  },
  autoLoad: {
    type: Boolean,
    default: false
  }
}

export default {
  props,
  components: {
    item
  },
  data() {
    let current = this.$moment()
    if (this.isHistory) {
      current.add('days', -1)
    }
    return {
      pageSize: 7,
      current: current.toDate(),
      itemList: []
    }
  },
  computed: {
    multiply() {
      if (this.isHistory) {
        return -1
      }
      return 1
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    loadData() {
      const dateList = []
      for(let i=0; i< this.pageSize; i++) {
        dateList.push(this.$moment(this.current).add('days', this.multiply * i).format('YYYY-MM-DD'))
      }

      this.$http.get('/api/chess/', {
        dateList: dateList.join(',')
      }).then(result => {
        this.current = this.$moment(this.current).add('days', this.multiply * this.pageSize).toDate()
        result.forEach(item => {
          this.itemList.push(item)
        })
      }).catch(_ => {
        console.error(_)
      })
    },

  }
}
</script>
