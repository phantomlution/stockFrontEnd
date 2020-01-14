<template>
  <div>
    <el-drawer :title="title" direction="ltr" size="42%" :visible.sync="visible">
      <div class="lr-report">
        <el-button @click.stop="generateReport">start</el-button>
        <el-timeline :reverse="true">
          <el-timeline-item v-if="item.rank.length > 0" :timestamp="item.date" v-for="item of report" :key="item.date">
            <div v-for="(rank, itemIndex) in item.rank" :key="itemIndex">
              <span>{{ rank.name }}</span>
              <span :style="{ 'color': rank.color}">{{ rank.label }}</span>
              <lr-number-tag :amount="rank.percent" />
            </div>
            <div style="margin-top: 8px">
              <history-tick :snapShot="true" :height="160" :code="code" :date="$moment(item.date).toDate()" />
            </div>
           </el-timeline-item>
        </el-timeline>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import lodash from 'lodash'
import historyTick from '../../../components/tradeChart/historyTick.vue'
import { getStockColor } from '@/utils'

export default {
  components: {
    historyTick
  },
  data() {
    return {
      code: '',
      title: '',
      visible: false,
      report: []
    }
  },
  computed: {
    simpleReport() {
//      return this.report.filter(item => item.result.length > 0)
    }
  },
  watch: {
    visible(val) {
      if (!val) {
        this.code = ''
        this.title = ''
        this.report = []
      }
    }
  },
  beforeDestroy() {
    this.$bus.$off('report')
  },
  mounted() {
    this.$bus.$on('report', model => {
      this.code = model.code
      this.title = `${model.name}.${model.code}`
      this.visible = true
    })
  },
  methods: {
    generateReport() {
      const code = this.code

      return new Promise((resolve, reject) => {
        Promise.all([
          this.$http.get('/api/data/base', {code}),
          this.getRecentDateList()
        ]).then(responseList => {
          const base = responseList[0]
          const dateList = responseList[1]

          // 提取板块排行榜
          this.$http.put(`/api/data/concept/ranking`, {
            dateList
          }).then(rankingList => {
            this.generate({
              code,
              base,
              dateList,
              rankingList
            })
          }).catch(_ => {
            reject(_)
          })
        }).catch(_ => {
          reject(_)
        })
      })
    },
    generate({ code, base, dateList, rankingList }) {
      const result = []
      const themeList = base.theme_list.filter(theme => theme.indexOf('昨日') === -1)

      dateList.forEach(date => {
        const rankingItem = rankingList.find(item => item.date === date)
        const ranking = rankingItem['ranking']
        const topRank = lodash.take(ranking, 10)
        const bottomRank = lodash.takeRight(ranking, 10)
        bottomRank.reverse()

        const model = {
          date,
          rank: []
        }
        themeList.forEach(theme => {
          const topIndex = topRank.findIndex(item => item.name === theme)
          if (topIndex !== -1) {
            model.rank.push({
              name: topRank[topIndex].name,
              label: `第${ topIndex + 1}名`,
              color: getStockColor(1),
              percent: topRank[topIndex].percent
            })
          }

          const bottomIndex= bottomRank.findIndex(item => item.name === theme)
          if (bottomIndex !== -1) {
            model.rank.push({
              name: bottomRank[bottomIndex].name,
              label: `倒数第${ bottomIndex + 1}名`,
              color: getStockColor(-1),
              percent: bottomRank[bottomIndex].percent
            })
          }

        })
        result.push(model)
      })
      if (code !== this.code) {
        return
      }
      this.$message.success('已生成')

      this.report = result
    },
    getRecentDateList() { // 获取最近的交易日期
      const code = this.code
      return new Promise((resolve, reject) => {
        this.$http.get(`/api/data/kline`, { code }).then(_ => {
          const dateList = lodash.takeRight(_, 22).map(item => item.date)
          resolve(dateList)
        }).catch(_ => {
          reject(_)
        })
      })
    }
  }
}

</script>

<style lang="scss">
.lr-report{
  .lr-box__content{
    padding: 0 !important;
  }
}
</style>
