<template>
  <div class="lr-box lr-disable-select">
    <template v-if="title">
      <div class="lr-box__title">
        {{ title }}
      </div>
      <div class="lr-box__content">
        <slot />
      </div>
    </template>
    <template v-else>
      <div class="lr-box__content">
        <slot />
      </div>
    </template>
  </div>
</template>

<script>
const props = {
  title: {
    type: String,
    default: ''
  }
}

export default {
  name: "LrBox",
  props
}

</script>

<style lang="scss">
.lr-box{
  background: #FFFFFF;
  box-shadow: 0 0 4px 0 rgba(0,0,0,0.10);
  border-radius: 3px;
  .lr-box__title{
    padding: 12px 16px;
    font-size: 16px;
    color: rgba(0,0,0,0.65);
    border-bottom: 1px solid rgba(0,0,0,0.16);
    font-weight: bold;
  }
  .lr-box__content{
    padding: 16px;
  }
}
</style>
