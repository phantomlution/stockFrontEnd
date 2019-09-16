<template>
  <div>
    <el-radio-group v-model="capitalType" style="width: 100%;text-align: center;margin-bottom: 16px">
      <el-radio-button label="hotmoney">北向资金</el-radio-button>
      <el-radio-button label="overall">大盘资金</el-radio-button>
      <el-radio-button label="economicData">经济数据</el-radio-button>
      <el-radio-button label="openAccountIndex">开户指数</el-radio-button>
    </el-radio-group>

    <div>
      <link-page v-show="capitalType === 'hotmoney'" src="http://data.eastmoney.com/hsgt/index.html"/>
      <link-page v-show="capitalType === 'overall'" src="http://data.eastmoney.com/zjlx/dpzjlx.html"/>
      <link-page v-show="capitalType === 'economicData'" src="http://data.eastmoney.com/center/macro.html"/>
      <link-page v-show="capitalType === 'openAccountIndex'" title="2019.02.25指数(1105)" src="http://index.baidu.com/v2/main/index.html#/trend/%E5%BC%80%E6%88%B7?words=%E5%BC%80%E6%88%B7" />
    </div>
  </div>
</template>

<script>
import linkPage from '@/views/stock/components/linkPage'

export default {
  components: {
    linkPage
  },
  data() {
    return {
      capitalType: 'hotmoney'
    }
  }
}
</script>
