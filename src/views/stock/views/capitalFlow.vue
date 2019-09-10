<template>
  <div>
    <el-radio-group v-model="capitalType" style="width: 100%;text-align: center;margin-bottom: 16px">
      <el-radio-button label="hotmoney">北向资金</el-radio-button>
      <el-radio-button label="overall">大盘资金</el-radio-button>
    </el-radio-group>

    <div>
      <link-page src="http://data.eastmoney.com/hsgt/top10.html" v-show="capitalType === 'hotmoney'"/>
      <link-page src="http://data.eastmoney.com/zjlx/dpzjlx.html" v-show="capitalType === 'overall'" />
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
