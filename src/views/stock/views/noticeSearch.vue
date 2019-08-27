<template>
  <lr-box>
    <el-form :inline="true">
      <el-form-item label="关键字">
        <el-input v-model="searchForm.keyword" style="width: 200px" readOnly/>
        <el-button type="primary" @click.stop="doSearch">搜索</el-button>
      </el-form-item>
    </el-form>
    <notice-list :list="noticeList" />
  </lr-box>
</template>

<script>
import noticeList from './noticeList.vue'
import stockUtils from '@/utils/stockUtils'

export default {
  components: {
    noticeList
  },
  data() {
    return {
      searchForm: {
        keyword: '质押展期'
      },
      noticeList: []
    }
  },
  mounted() {
    this.doSearch()
  },
  methods: {
    doSearch() {
      this.loadData()
    },
    loadData() {
      this.noticeList = []
      const keyword = this.searchForm.keyword
      const result = []
      this.$http.get(`/api/stock/notice/search`, {
        keyword
      }).then(_ => {
        // 生成聚合数据
        _.forEach(notice => {
          result.push.apply(result, notice.data.filter(item => item['NOTICETITLE'].indexOf(keyword) !== -1))
        })
        this.noticeList = stockUtils.parseRawNoticeList(result)
      }).catch(_ => {
        console.error(_)
      })
    }
  }
}
</script>
