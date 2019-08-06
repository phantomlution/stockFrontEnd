<template>
  <lr-box title="做T计算器">
    <el-form>
      <el-form-item label="成本">
        <el-input v-model.trim="historyPrice" :style="inputStyle">
          <span slot="prepend">价格</span>
        </el-input>
        <el-input v-model.trim="historyCount" :style="inputStyle">
          <span slot="prepend">手数</span>
        </el-input>
      </el-form-item>
      <el-form-item label="现价">
        <el-input v-model.trim="currentPrice" :style="inputStyle">
          <span slot="prepend">价格</span>
        </el-input>
        <el-input :value="historyTurnOver" :style="inputStyle" readOnly>
          <span slot="prepend">盈亏</span>
        </el-input>

      </el-form-item>
      <el-form-item label="买入">
        <el-input v-model.trim="currentCount" :style="inputStyle">
          <span slot="prepend">手数</span>
        </el-input>
        <el-input v-model.trim="currentAmount" :style="inputStyle" >
          <span slot="prepend">金额</span>
          <span slot="append">万元</span>
        </el-input>
        <el-input :value="newTurnOver" :style="inputStyle" readOnly>
          <span slot="prepend">盈亏</span>
        </el-input>
        <el-input :value="newCost" :style="inputStyle" readOnly>
          <span slot="prepend">成本</span>
        </el-input>
      </el-form-item>
      <el-form-item>
        <div style="text-align: right">
          <el-button @click.stop="reset">重置</el-button>
        </div>
      </el-form-item>
    </el-form>
  </lr-box>
</template>

<script>
import lodash from 'lodash'

export default {
  data() {
    return {
      historyPrice: '',
      historyCount: '',
      currentPrice: '',
      currentCount: '',
      newCost: '', // 做T后的新成本
      newTurnOver: '', //
    }
  },
  computed: {
    inputStyle() {
      return {
        width: '200px'
      }
    },
    historyTurnOver() {
      // 计算历史盈亏
      const result = (this.currentPrice * this.historyCount - this.historyPrice * this.historyCount) / (this.historyPrice * this.historyCount)
      return `${ lodash.round(result * 100, 2)}%`
    },
    currentAmount() {
      return lodash.round(this.currentPrice * this.currentCount / 100, 3)
    }
  },
  watch: {
    currentCount() {
      // 计算稀释后的成本
      const result1 = (Number(this.currentPrice) * Number(this.currentCount) + Number(this.historyPrice) * Number(this.historyCount) )/ (Number(this.currentCount) + Number(this.historyCount) )
      this.newCost = result1

      // 计算稀释后的盈亏
      const result2 = (Number(this.currentPrice) - result1) / Number(this.currentPrice)
      this.newTurnOver = `${ lodash.round(result2 * 100, 3)}%`
    }
  },
  methods: {
    reset() {
      this.historyPrice = ''
      this.historyCount = ''
      this.currentPrice = ''
      this.currentCount = ''
    }
  }
}
</script>
