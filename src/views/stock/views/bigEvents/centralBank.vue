<template>
  <lr-box>
    <el-timeline>
      <el-timeline-item :timestamp="item.date" placement="top" v-for="(item, itemIndex) of itemList" :key="itemIndex">
        <el-card>
          <h4>央行日程</h4>
          <p>
            <el-tag v-for="(bank, bankIndex) of item.bankList" :key="bankIndex" size="large">
              <el-button type="text" @click.stop="toDetail(bank)">{{ bank }}</el-button>
            </el-tag>
          </p>
        </el-card>
      </el-timeline-item>
    </el-timeline>
  </lr-box>
</template>

<script>
export default {
  data() {
    return {
      bankList: [],
      itemList: []
    }
  },
  mounted() {
    this.loadData()
  },
  methods: {
    loadData() {
      this.$http.get(`/api/financial/centralBank`).then(response => {
        this.bankList = response.bankList
        const result = response.data

        result.sort((former, later) => {
          return this.$moment(former.date).toDate().getTime() - this.$moment(later.date).toDate().getTime()
        })

        this.itemList = result.filter(item => {
          return this.$moment(item.date).add('days', 3).toDate().getTime() >= new Date().getTime()
        })
      }).catch(_ => {
        console.error(_)
      })
    },
    toDetail(bankName) {
      const bank = this.bankList.find(item => item.name === bankName)
      window.open(`https://bank.fx678.com/${ bank.key }`)
    }
  }
}
</script>
