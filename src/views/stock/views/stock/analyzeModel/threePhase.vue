<template>
  <div>
    <analyze-wrapper :analyzePromise="startAnalyze">
      <el-form :inline="true" slot="params">
        <el-form-item label="流量回归">
          <el-switch v-model="flowReturn"  />
        </el-form-item>
        <el-form-item label="连续点个数">
          <el-input-number v-model="continuousCount" :min="3" />
        </el-form-item>
        <el-form-item label="是否历史涨停">
          <el-switch v-model="hasEverLimitUp" />
        </el-form-item>
      </el-form>
    </analyze-wrapper>
  </div>
</template>

<script>
import { RANGE_END_IN_DAYS } from '@/utils/stock'
import { STOCK_PRICE_MIN, STOCK_PRICE_MAX } from '@/utils/stock'
import lodash from 'lodash'
import { idGenerator, deepClone } from '@/utils'
import analyzeWrapper from './analyzeWrapper.vue'

export default {
  components: {
    analyzeWrapper
  },
  data() {
    return {
      flowReturn: false, // 是否考虑流量回归
      continuousCount: 3, // 连续数据点个数
      hasEverLimitUp: true,
    }
  },
  computed: {
    stockMap() {
      return this.$store.state.data.stockMap
    }
  },
  methods: {
    startAnalyze() {
      const itemList = this.analyzeProbability()
      return this.rankItem(itemList)
    },
    getTargetStockResultRange(stock, beforeDays = 0) {
      return lodash.slice(stock.result, 0, stock.result.length - beforeDays)
    },
    calculateSecondPhaseResult(data) {
      const simplifiedTrendData = this.simplifySecondPhaseTrendData(data)
      return this.calculateSecondPhaseGraphProbability(simplifiedTrendData)
    },
    calculateSecondPhaseGraphProbability(arr) { // 判断数据点是否符合二阶段
      /*
       * 1. 找到找到所有可能的极小值
       * 2. 找到极小值之后，不跌的点的个数
       * 3. 确定整个不跌的区间
       * 4. 通过不跌的区间，判断前后是否都是下跌趋势
       * 5. 判断是否存在一个二阶段
       */
      const ABOVE_TEMP_MIN_COUNT = 5 // 之后大于极小值的个数

      // 收集所有的极小值
      const TEMP_MIN_POSITION = []
      for(let i=0; i<arr.length; i++) {
        if (i > 0 && i< arr.length - 1) {
          if (arr[i].close <= arr[i - 1].close && arr[i].close <= arr[i + 1].close) {
            TEMP_MIN_POSITION.push(i)
          }
        }
      }

      // 找到满足大于指定个极小值个数的位置
      let VALID_MIN_POSITION = []
      TEMP_MIN_POSITION.forEach(tempMinPosition => {
        let biggerThanTempMinItem = []
        for (let i=tempMinPosition + 1; i<arr.length; i++) {
          if (arr[i].close >= arr[tempMinPosition].close * 0.98) { // 0.98提高容错率
            biggerThanTempMinItem.push(arr[i])
          } else {
            break
          }
        }
        const biggerThanTempMinCount = biggerThanTempMinItem.length

        if (biggerThanTempMinCount >= ABOVE_TEMP_MIN_COUNT) {
          // 计算弹性方差,使用百分比
          const targetData = arr[tempMinPosition]
          const bounceRateList = biggerThanTempMinItem.map(item => {
            // 需要放大振幅，获取比例去计算
            const amplitude = (item.close - targetData.close) / targetData.close * 100

            return Math.pow(amplitude, 2)
          })

          const variance = lodash.mean(bounceRateList)
          const bounceRate = lodash.round(Math.sqrt(variance), 2)

          VALID_MIN_POSITION.push({
            startDate: targetData.date,
            offsetEndDate: arr[tempMinPosition + biggerThanTempMinCount].date,
            offsetEndClose: arr[tempMinPosition + biggerThanTempMinCount].close,
            vibrateCount: biggerThanTempMinCount,
            startClose: targetData.close,
            bounceRate,
            start: tempMinPosition,
            offset: biggerThanTempMinCount
          })
        }
      })

      // 只保留最新的区间
      VALID_MIN_POSITION.sort((former, later) => {
        return (later.start + later.offset) - (former.start + former.offset)
      })
      if (VALID_MIN_POSITION.length > 1) {
        VALID_MIN_POSITION = [VALID_MIN_POSITION[0]]
      }

      const secondPhaseGraph = []

      // 计算非下跌区间之前最大和之后的最大累计跌幅
      VALID_MIN_POSITION.forEach(validMinPosition => {
        // 区间之前的最高点
        let beforeRangeMaxValue = lodash.max(arr.filter((item, itemIndex) => itemIndex < validMinPosition.start).map(item => item.close))
        // 计算区间之后的最低点
        let afterRangeMinValue = lodash.min(arr.filter((item, itemIndex) => itemIndex > validMinPosition.start + validMinPosition.offset).map(item => item.close))
        // 符合二阶段的点必须前后都大于5个点

        const beforeRangeFallPercent = (validMinPosition.startClose - beforeRangeMaxValue) / beforeRangeMaxValue * 100
        const afterRangeFallPercent = (afterRangeMinValue - validMinPosition.startClose) / validMinPosition.startClose * 100
        const totalFallPercent = beforeRangeFallPercent + afterRangeFallPercent

        // 暂时不考虑第三段 (afterRangeFallPercent <= -5)
        if (beforeRangeFallPercent <= -15 ) {
          secondPhaseGraph.push(Object.assign({
            beforeRangeFallPercent,
            afterRangeFallPercent,
            totalFallPercent
          }, validMinPosition))
        }
      })
      return secondPhaseGraph
    },
    simplifySecondPhaseTrendData(data) { // 简化趋势模型
      const result = []
      for (let i=0; i<data.length; i++) {
        let current = null
        if (i === 0 || i === data.length -1) {
          current = data[i].close
        } else {
          let avgList = [
            data[i - 1].close,
            data[i].close,
            data[i + 1].close
          ]
          current = lodash.mean(avgList)
        }
        result.push({
          date: data[i].date,
          close: current
        })
      }
      return result
    },
    rankItem(data) {
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
        .filter(item => item.amountInMillion >= 20) // 成交量基本要求
        .filter(item => item.closeMaxIncrement <= -20) // 低于最高值 20%

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
      } else {
        firstRoundDataList = firstRoundDataList.filter(item => item.limitUpCount === 0) // 发生过涨停，至少证明曾经有游资
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

      this.dataList = secondRoundDataList.map(item => {
        return {
          name: item.name,
          code: item.code,
          desc: item.desc
        }
      })

      return Promise.resolve(this.dataList)
    },
    analyzeProbability() {
      const collector = []
      for(let stock of this.stockMap.values()) {
        // 回溯天数
        let beforeDays = 0

        const targetStockResult = this.getTargetStockResultRange(stock, beforeDays)
        // 已复盘至指定日期
        let days = RANGE_END_IN_DAYS
        let recentCalculateItemList = lodash.takeRight(targetStockResult, days)
        if (recentCalculateItemList.length === days) {
          const today = recentCalculateItemList[recentCalculateItemList.length - 1]
          // 复盘
          const newTargetStockResultList = lodash.takeRight(this.getTargetStockResultRange(stock, 0), beforeDays)
          let mostRecentDay = newTargetStockResultList[newTargetStockResultList.length - 1]
          if (!mostRecentDay) { // 修复对当日复盘时的异常数据点
            mostRecentDay = {
              close: today.close
            }
          }

          const secondPhaseResult = this.calculateSecondPhaseResult(lodash.takeRight(targetStockResult, 45))

          const targetStockResultData = lodash.takeRight(targetStockResult, 100)
          const closePriceList = targetStockResultData.map(item => item.close)
          const limitUpCount = targetStockResultData.filter(item => item.percent >= 9.9).length

          const model = {
            code: stock.code,
            name: stock.name,
            targetDate: today.date,
            lastDiff: today.diff,
            close: today.close,
            amount: today.amount,
            amountInMillion: today.amountInMillion,
            minClose: lodash.min(closePriceList),
            maxClose: lodash.max(closePriceList),
            recentItemList: deepClone(recentCalculateItemList),
            limitUpCount,
          }

          model.closeMaxIncrement = lodash.round((model.close / model.maxClose - 1) * 100)
          model.desc = `低于最高:${ model.closeMaxIncrement }%`
          collector.push(model)
        }
      }

      return collector
    }
  }
}
</script>
