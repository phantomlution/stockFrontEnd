<template>
  <div>
    <el-tabs type="border-card" tabPosition="left">
      <el-tab-pane label="全部">
        <notice-list :list="totalList" :table-height="height" />
      </el-tab-pane>
      <el-tab-pane :label="item.name" :key="itemIndex" v-for="(item, itemIndex) of noticeList">
        <notice-list :list="item.list" :table-height="height" :code="item.code" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import noticeList from '@/views/stock/components/noticeList.vue'

const props = {
  stockList: {
    type: Array,
    required: true
  }
}
export default {
  props,
  components: {
    noticeList,
  },
  data() {
    return {
      noticeList: []
    }
  },
  watch: {
    stockList() {
      this.loadNotice()
    }
  },
  mounted() {
    this.loadNotice()
  },
  computed: {
    height() {
      return `${ 40 * (this.noticeList.length + 1) }`
    },
    totalList() {
      const result = []
      this.noticeList.forEach(item => {
        result.push.apply(result, item.list)
      })
      return result
    }
  },
  methods: {
    loadNotice() {
      Promise.all(this.stockList.map(item => this.getNoticeDetail(item))).then(noticeList => {
        this.noticeList = noticeList
      }).catch(_ => {
        console.log(_)
      })
    },
    getNoticeDetail(item) {
      return new Promise((resolve, reject) => {
        const code = item.code
        this.$http.get(`/api/stock/notice?code=${code}`).then(res => {
          resolve({
            ...item,
            list: res
          })
        }).catch(_ => {
          reject(_)
        })
      })
    },
    showStockDetail(code) {
      this.$bus.$emit('showStockDetail', code)
    }
  }
}
</script>
