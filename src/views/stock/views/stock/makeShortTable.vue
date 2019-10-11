<template>
  <lr-box style="position: relative">
    <!-- 工具条 -->
    <lr-stick-bar title="选股助手" width="600" top="128px">
      <div>
        <div style="display: flex">
          <template v-if="currentRowModel">
            <div style="flex: 1">
              <div style="margin-bottom: 8px">
                <span style="font-weight: bold;font-size: 16px">{{ currentRowModel.name }}</span>
              </div>
              <div v-if="currentRowModel.theme_list.length > 0">
                <el-tag v-for="(theme, themeIndex) of currentRowModel.theme_list" :key="themeIndex">
                  {{ theme }}
                </el-tag>
              </div>
            </div>
            <div style="margin: 0 16px;">
              <div>
                <div class="lr-make-short-table-label">低于最高：{{ currentRowModel.closeMaxIncrement }}%</div>
              </div>
              <div>
                <div class="lr-make-short-table-label">高于最低：{{ currentRowModel.closeMinIncrement }}%</div>
              </div>
            </div>
            <div>
              <div><el-button type="text" @click.stop="toPrevious">上一条</el-button></div>
              <div><el-button type="text" @click.stop="toNext">下一条</el-button></div>
            </div>
          </template>
          <template v-else>
            <div style="display: flex;justify-content: center;align-items: center;width: 100%;">
              <el-button type="primary" @click.stop="setRowIndex(0)">查看第一条</el-button>
            </div>
          </template>
        </div>
      </div>
    </lr-stick-bar>
    <div>
      <el-form :inline="true">
        <el-form-item label="总记录数">
          {{ dataList.length }}
        </el-form-item>
        <el-form-item label="流量回归">
          <el-switch v-model="flowReturn"  />
        </el-form-item>
        <el-form-item label="连续点个数">
          <el-input-number v-model="continuousCount" :min="3" />
        </el-form-item>
        <el-form-item label="是否历史涨停">
          <el-switch v-model="hasEverLimitUp" />
        </el-form-item>
        <el-form-item label="高于最低值%">
          <el-input-number v-model="overMinPercent" />
        </el-form-item>
      </el-form>
    </div>
    <el-table :highlight-current-row="true" ref="table" border sortable :data="dataList" :line-numbers="true" :defaultSort="defaultSort" maxHeight="300px">
      <el-table-column type="index" />
      <el-table-column label="code">
        <template slot-scope="props">
          <span>(L{{ props.row.rank}},{{ props.row.diffIncrement }}%){{ props.row.code }}({{ props.row.name}}),{{ props.row.targetDate }},{{ props.row.profit }}%</span>
          <el-button type="text" @click.stop="setRowIndex(props.$index)">查看</el-button>
          <span>{{ props.row.bounceRate }}</span>
        </template>
      </el-table-column>
      <el-table-column label="theme">
        <template slot-scope="props">
          <el-tag v-for="(theme, themeIndex) of props.row.themeList" :key="themeIndex">{{ theme }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="最高" prop="closeMaxIncrement">
        <template slot-scope="props">
          {{ props.row.closeMaxIncrement}}%
        </template>
      </el-table-column>
      <el-table-column label="最低">
        <template slot-scope="props">
          {{ props.row.close }}({{ props.row.closeMinIncrement }}%)
        </template>
      </el-table-column>
    </el-table>
  </lr-box>
</template>

<script>
import lodash from 'lodash'
import { STOCK_PRICE_MIN, STOCK_PRICE_MAX } from '@/utils/stock'

export default {
  data() {
    return {
      flowReturn: false, // 是否考虑流量回归
      continuousCount: 3, // 连续数据点个数
      hasEverLimitUp: true,
      overMinPercent: 5, // 高于最低值百分比
      dataList: [],
      currentRowModel: null,
      currentRowIndex: -1,
      defaultSort: {
        prop: 'closeMaxIncrement',
        order: 'ascending'
      }
    }
  },
  watch: {
    flowReturn() {
      this.refresh()
    },
    hasEverLimitUp() {
      this.refresh()
    },
    continuousCount() {
      this.refresh()
    },
    overMinPercent() {
      this.refresh()
    },
    currentRowIndex(rowIndex) {
      if (rowIndex === -1) {
        this.currentRowModel = null
      } else {
        // 获取表格最终渲染的顺序
        const currentRow = this.$refs.table.tableData[rowIndex]
        this.$refs.table.setCurrentRow(currentRow)
        this.showDetail(currentRow.code)
        this.currentRowModel = currentRow
      }
    }
  },
  mounted() {
    this.$bus.$on('analyzeMakeShort', data => {
      this.currentRowIndex = -1
      /**
       * 分级
       */
      data.forEach(item => {
        item.rank = 0

        const recentItemLength = item.recentItemList.length
        let positiveTrendCount = 0
        let continuousCount = this.continuousCount

        // 计算热度
        item.diffIncrement = item.recentItemList[recentItemLength - 1].diff - item.recentItemList[recentItemLength - 6].diff
        item.diffIncrement = Math.ceil(item.diffIncrement)

        if (recentItemLength >= continuousCount) {
          for(let i = recentItemLength - 1; i > recentItemLength - continuousCount; i--) {
            let result = item.recentItemList[i].diff - item.recentItemList[i - 1].diff > 0 ? 1 : 0
            if (result === 1) {
              positiveTrendCount++
            }
          }
          if (positiveTrendCount >= (continuousCount - 2)) {
            item.rank = 3
          }
        }
      })


      let firstRoundDataList = data
        .filter(item => item.close >= STOCK_PRICE_MIN)
        .filter(item => item.close <= STOCK_PRICE_MAX)
        .filter(item => item.closeMaxIncrement <= -20) // 低于最高值 20%
        .filter(item => item.closeMinIncrement <= this.overMinPercent) // 高于最低值百分比

//        .filter(item => item.diffIncrement > 0)
//        .filter(item => item.secondPhaseCount > 0) // 必须存在二阶段的点
//

      // 低价的股票可能说明股票没有价值

      // 考虑流量回归模型
      if (this.flowReturn) {
        firstRoundDataList = firstRoundDataList.filter(item => item.rank === 3)
      }
      if (this.hasEverLimitUp) {
        firstRoundDataList = firstRoundDataList.filter(item => item.limitUpCount > 0) // 发生过涨停，至少证明曾经有游资
      }

      // 为了精简点数，进行数据剔除(采用天地人三个数)
      let secondRoundDataList = firstRoundDataList

      const threePercentDataList = firstRoundDataList.filter(item => item.closeIncrement <= 3)
      const sixPercentDataList = firstRoundDataList.filter(item => item.closeIncrement <= 6)
      const ninePercentDataList = firstRoundDataList.filter(item => item.closeIncrement <= 9)
      if (threePercentDataList.length >= 100) {
        secondRoundDataList = threePercentDataList
      } else if (sixPercentDataList.length >= 100) {
        secondRoundDataList = sixPercentDataList
      } else if (ninePercentDataList.length >= 100) {
        secondRoundDataList = ninePercentDataList
      }

      const finalRoundDataList = secondRoundDataList
      this.dataList = finalRoundDataList.filter(item => { // 暂时剔除创业板
        return item.code.indexOf('SZ300') === -1
      })

      const secondPhaseMap = this.$store.state.data.secondPhaseMap
      secondPhaseMap.clear()
      this.dataList.forEach(item => {
        secondPhaseMap.set(item.code, item)
      })
    })
  },
  beforeDestroy() {
    this.$bus.$off('analyzeMakeShort')
  },
  methods: {
    setRowIndex(rowIndex) { // 设置当前行数
      this.currentRowIndex = rowIndex
    },
    toPrevious() {
      if (this.currentRowIndex === 0) {
        return this.$message.warning('已经是第一条了')
      } else if (this.currentRowIndex <= this.dataList.length - 2) {
        this.currentRowIndex -= 1
      }
    },
    toNext() {
      if (this.currentRowIndex === this.dataList.length - 1) {
        return this.$message.warning('已经是最后一条了')
      } else {
        this.currentRowIndex += 1
      }
    },
    refresh() {
      this.$bus.$emit('restartAnalyzeProbability')
    },
    showDetail(code) {
      this.$bus.$emit('searchStockDetail', {
        code
      })
    }
  }
}
</script>

<style lang="scss">
.lr-make-short-table-label{
  font-size: 14px;
  line-height: 1.5;
  display: inline-block;
  padding: 4px;
  color: rgba(0, 0, 0, 0.65)
}
</style>
