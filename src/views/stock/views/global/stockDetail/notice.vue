<template>
  <notice-list :list="noticeList" :code="code" table-height="calc(100vh - 150px)"/>
</template>

<script>
import noticeList from '@/views/stock/components/noticeList'

const props = {
  code: {
    type: String,
    required: true
  }
}
export default {
  props,
  components: {
    noticeList
  },
  data() {
    return {
      noticeList: []
    }
  },
  mounted() {
    this.loadNoticeList()
  },
  methods: {
    loadNoticeList() {
      const code = this.code
      return this.$http.get(`/api/stock/notice`, { code }).then(list => {
        this.noticeList = list
      }).catch(_ => {
        console.error(_)
      })
    },
  }
}
</script>
