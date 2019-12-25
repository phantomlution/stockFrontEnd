<template>
  <div>
    <span>{{ item.time }}</span>
    <el-divider direction="vertical"></el-divider>
    <span>{{ item.country }}</span>
    <el-divider direction="vertical"></el-divider>
    <span>{{ item.area }}</span>
    {{ item.name }}
  </div>
</template>

<script>
const props = {
  item: {
    type: Object,
    required: true
  }
}
export default {
  props,
}
</script>
