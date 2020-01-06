<template>
  <div class="lr-motto__wrapper">
    <div class="lr-motto__content el-message--warning">
      <div class="el-message__content">
        <slot />
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
.lr-motto__wrapper{
  & + .lr-motto__wrapper{
    margin-top: 8px;
  }
}
.lr-motto__content{
  box-sizing: border-box;
  border-width: 1px;
  border-style: solid;
  padding: 9px 12px;
  display: flex;
  align-items: center;
  .el-message__content{
    font-size: 13px;
  }

}
</style>
