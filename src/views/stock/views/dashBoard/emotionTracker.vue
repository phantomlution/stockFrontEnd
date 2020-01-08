<template>
  <div class="lr-emotion-tracker">
    <el-popover>
      <div>
        <el-table :data="rankList" maxHeight="400px">
          <el-table-column type="index" />
          <el-table-column prop="name" label="概念名称" />
          <el-table-column prop="percent" label="涨跌幅">
            <template slot-scope="scope">
              {{ scope.row.percent }}%
            </template>
          </el-table-column>
        </el-table>
      </div>
      <el-link :underline="false" slot="reference" style="margin-top: -4px">被动情绪点&nbsp;</el-link>
    </el-popover>
    <div style="display: inline-block" v-if="riskModelList.length > 0">
      <span v-for="item of riskModelList" :key="item.name">
        <span style="color: red">{{ item.name }}</span>
        <span>(涨幅第<span style="color: red">{{ item.index }}</span>位,<lr-number-tag :amount="item.percent" />)</span>
      </span>
    </div>
  </div>
</template>

<script>
import lodash from 'lodash'
import scheduleMixin, { STOP_CALLBACK_FOR_STOCK } from '@/mixins/schedule'

export default {
  mixins: [scheduleMixin],
  data() {
    return {
      riskModel: {
        gold: null
      },
      rankList: [],
      riskItemList: [
        {
          name: 'ST概念'
        },
        {
          name: '黄金概念'
        },
        {
          name: '券商概念'
        }
      ],
      riskModelList: []
    }
  },
  mounted() {
    this.startSchedule(this.loadData, 15, STOP_CALLBACK_FOR_STOCK)
  },
  methods: {
    loadData() {
      this.$store.dispatch('getConceptBlock').then(itemList => {
        this.rankList = lodash.take(itemList, 20)

        const riskModelList = []
        this.riskItemList.forEach(riskItem => {
          const riskItemIndex = itemList.findIndex(item => item.name === riskItem.name)
          if (riskItemIndex !== -1 && riskItemIndex < 10) {
            const currentRiskItem = itemList.find(item => item.name === riskItem.name)
            riskModelList.push({
              name: riskItem.name,
              index: riskItemIndex + 1,
              percent: currentRiskItem.percent
            })
          }
        })
        this.riskModelList = riskModelList
      }).catch(_ => {
        console.error(_)
      })
    }
  }
}
</script>

<style lang="scss">
.lr-emotion-tracker{
  font-size: 14px;
  height: 28px;
  line-height: 28px;
}
</style>
