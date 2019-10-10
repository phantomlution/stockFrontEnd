<template>
  <div>
    <div>
      <div>
        <searchStock v-model="stockCode" ref="searchStock" />
        <el-button type="primary" @click.stop="addToPool">添加</el-button>
        <el-button type="primary" @click.stop="getNotice">查看公告</el-button>
        <el-button type="primary" @click.stop="refresh">启动</el-button>
      </div>
      <div style="margin-top: 16px">
        <el-tag v-for="(tag, tagIndex) of stockPool" :key="tagIndex" size="medium" closable @close="removeTag(tagIndex)">
          {{ tag.name }}({{ tag.code }})
        </el-tag>
      </div>
    </div>
    <div style="margin-top: 8px">
      <el-tabs type="border-card">
        <el-tab-pane label="全部">
          <notice-list :list="totalList" />
        </el-tab-pane>
        <el-tab-pane :label="item.name" :key="itemIndex" v-for="(item, itemIndex) of noticeList">
          <notice-list :list="item.list" />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import noticeList from './noticeList.vue'
import searchStock from '@/views/stock/components/searchStock.vue'
import stockUtils from '@/utils/stockUtils'

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
  mounted() {
    this.refresh()
  },
  methods: {
    refresh() {
      this.loadStockPool()
    },
    loadStockPool() {
      this.$http.get(`/api/stock/pool`).then(_ => {
        this.stockPool =  _
      }).catch(_ => {
        console.log(_)
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

      const item = {
        name: codeItem.label,
        code: codeItem.value
      }

      this.$http.post('/api/stock/pool', item).then(_ => {
        this.refresh()
      }).catch(_ => {
        console.log(_)
      })
    },
    removeTag(tagIndex) {
      const item = this.stockPool[tagIndex]
      const code = item['code']

      this.$http.delete('/api/stock/pool', { code }).then(_ => {
        this.refresh()
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
        const code = item.code
        this.$http.get(`/api/stock/notice?code=${code}`).then(res => {
          res.forEach(resItem => {
            resItem.stockName = item['name']
            resItem.stockCode = item['code']
          })
          resolve({
            ...item,
            list: res
          })
        }).catch(_ => {
          reject(_)
        })
      })
    }
  }
}
</script>
