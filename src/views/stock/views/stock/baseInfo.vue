<template>
  <div v-if="base">
    <el-form label-width="100px">
      <el-form-item label="所属主题" style="color: rgba(0, 0, 0, 0.65);font-size: 14px">
        <el-tag v-for="(theme, themeIndex) of base.themeList" :key="themeIndex">
          {{ theme }}
        </el-tag>
      </el-form-item>
      <el-form-item label="公司简介" style="color: rgba(0, 0, 0, 0.65);font-size: 14px">
        {{ base.company.org_cn_introduction || '-' }}
      </el-form-item>
      <el-form-item label="主营业务" style="color: rgba(0, 0, 0, 0.65);font-size: 14px">
        {{ base.company.main_operation_business || '-' }}
      </el-form-item>
      <el-form-item label="省份" style="color: rgba(0, 0, 0, 0.65);font-size: 14px">
        {{ base.company.provincial_name || '-' }}
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
const props = {
  base: {
    type: Object,
    required: true
  }
}

export default {
  props
}
</script>
