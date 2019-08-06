<template>
  <div>
    <lr-box>
      <div>
        <searchStock v-model="stockCode" ref="searchStock" />
        <el-button type="primary" @click.stop="addToPool">添加</el-button>
        <el-button type="primary" @click.stop="getNotice">查看公告</el-button>
        <el-button type="primary" @click.stop="refresh">启动</el-button>
      </div>
      <div style="margin-top: 16px">
        <el-tag v-for="(tag, tagIndex) of stockPool" :key="tagIndex" size="medium" closable @close="removeTag(tagIndex)">
          {{ tag.label }}({{ tag.value }})
        </el-tag>
      </div>
    </lr-box>
    <lr-box>
      <el-tabs type="border-card">
        <el-tab-pane label="全部">
          <notice-list :list="totalList" />
        </el-tab-pane>
        <el-tab-pane :label="item.label" :key="itemIndex" v-for="(item, itemIndex) of noticeList">
          <notice-list :list="item.list" />
        </el-tab-pane>
      </el-tabs>
    </lr-box>
  </div>
</template>

<script>
import noticeList from './noticeList.vue'
import searchStock from '@/views/stock/components/searchStock.vue'

export default {
  components: {
    noticeList,
    searchStock
  },
  data() {
    return {
      stockCode: '',
      stockPool: [],
      noticeList: []
    }
  },
  computed: {
    totalList() {
      const result = []
      this.noticeList.forEach(item => {
        result.push.apply(result, item.list)
      })
      return result
    }
  },
  watch: {
    stockPool() {
      this.getNotice()
    }
  },
  methods: {
    refresh() {
      this.loadStockPool()
    },
    loadStockPool() {
      return new Promise((resolve, reject) => {
        this.$http.get(`/api/stock/pool`).then(_ => {
          if (_.list) {
            this.stockPool.push.apply(this.stockPool, _.list)
          }
          resolve(_)
        }).catch(_ => {
          console.log(_)
          reject(_)
        })
      })
    },
    addToPool() {
      const codeItem = this.$refs.searchStock.getCurrent()
      if (!codeItem) {
        this.$message.warning('请先选择股票')
        return
      }
      if (this.stockPool.find(item => item.value === codeItem.value)) {
        this.$message.error('当前股票已存在')
        return
      }
      const newList = this.stockPool.map(item => item)
      newList.push(codeItem)
      this.$http.put('/api/stock/pool', newList).then(_ => {
        this.stockPool.push(codeItem)
      }).catch(_ => {
        console.log(_)
      })
    },
    removeTag(tagIndex) {
      const newList = this.stockPool.map(item => item).splice(tagIndex, 1)
      this.$http.put('/api/stock/pool', newList).then(_ => {
        this.stockPool.splice(tagIndex, 1)
      }).catch(_ => {
        console.log(_)
      })
    },
    getNotice() {
      Promise.all(this.stockPool.map(item => this.getNoticeDetail(item))).then(noticeList => {
        this.noticeList = noticeList
      }).catch(_ => {
        console.log(_)
      })
    },
    getNoticeDetail(item) {
      return new Promise((resolve, reject) => {
        const code = item.value.substring(2)
        this.$http.get(`/api/stock/notice?code=${code}`).then(res => {
          const responseJson = JSON.parse(res)
          resolve({
            code: code,
            ...item,
            list: this.parseNoticeList(responseJson['data'])
          })
        }).catch(_ => {
          reject(_)
        })
      })
    },
    parseNoticeList(rawNoticeList) {
      return rawNoticeList.map(item => {
        return {
          title: item.NOTICETITLE,
          date: new Date(item.NOTICEDATE).getTime(),
          type: item["ANN_RELCOLUMNS"][0].COLUMNNAME,
          url: item.Url
        }
      })
    }
  }
}
</script>
