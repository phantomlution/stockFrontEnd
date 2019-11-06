<template>
  <div>
    <div>
      <el-form>
        <el-form-item label="相关数据">
          <el-link type="danger" href="http://data.eastmoney.com/hsgt/index.html" target="_blank">北向资金</el-link>
        </el-form-item>
      </el-form>
    </div>
    <div>

      <replay />
     </div>
  </div>
</template>

<script>
import replay from './replay'
export default {
  components: {
    replay
  }
}
</script>
