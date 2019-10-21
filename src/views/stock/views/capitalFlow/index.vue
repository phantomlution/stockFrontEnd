<template>
  <div>
    <el-radio-group v-model="capitalType" style="width: 100%;text-align: center;margin-bottom: 16px">
      <el-radio-button label="hotMoney">北向资金</el-radio-button>
      <el-radio-button label="overall">大盘资金</el-radio-button>
      <el-radio-button label="hotMoneyReplay">资金历史走势</el-radio-button>
    </el-radio-group>

    <div>
      <div v-show="capitalType === 'hotMoney'">
        <lr-link-page src="http://data.eastmoney.com/hsgt/index.html"/>
      </div>
      <div v-show="capitalType === 'overall'">
        <lr-link-page src="http://data.eastmoney.com/zjlx/dpzjlx.html"/>
      </div>
      <div v-if="capitalType === 'hotMoneyReplay'">
        <replay />
      </div>
     </div>
  </div>
</template>

<script>
import replay from './replay'
export default {
  components: {
    replay
  },
  data() {
    return {
      capitalType: 'hotMoney'
    }
  }
}
</script>
