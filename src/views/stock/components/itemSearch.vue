<template>
  <div>
    <el-cascader v-model="current" filterable clearable :options="$store.getters.searchOptionList"></el-cascader>
  </div>
</template>

<script>

export default {
  data() {
    return {
      current: null,
    }
  },
  watch: {
    current(val) {
      if (val && val.length === 2) {
        val = val[1]
      } else {
        val = ''
      }
      this.$emit('change', val)
    }
  }
}
</script>
