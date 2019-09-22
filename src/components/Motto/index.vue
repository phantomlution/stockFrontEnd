<template>
  <div class="lr-motto__wrapper">
    <div class="lr-motto__content el-message--warning">
      <div class="el-message__content">
        <div>不仅要对<span style="color: red;font-weight: bold">风险</span>敏感，也要对<span style="color: red;font-weight: bold">收益</span>敏感</div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LrMotto'
}
</script>

<style lang="scss">
.lr-motto__wrapper {
  padding: 8px;
}

.lr-motto__content{
  box-sizing: border-box;
  border-width: 1px;
  border-style: solid;
  padding: 15px 15px 15px 20px;
  display: flex;
  align-items: center;

}
</style>
