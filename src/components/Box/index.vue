<template>
  <div class="lr-box lr-disable-select">
    <div class="lr-box__title" v-if="$slots.title || title">
      <div style="display: flex">
        <div style="flex: 1">
          <template v-if="$slots.title">
            <slot name="title" />
          </template>
          <template v-else>
            {{ title }}
          </template>
        </div>
        <slot name="right" v-if="$slots.right"></slot>
      </div>
    </div>
    <div class="lr-box__center" v-if="$slots.center">
      <slot name="center" />
    </div>
    <div class="lr-box__content">
      <slot />
    </div>
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
  position: relative;
  box-shadow: 0 0 4px 0 rgba(0,0,0,0.10);
  border-radius: 3px;
  & + .lr-box{
    margin-top: 16px;
  }
  .lr-box__title{
    padding: 12px 16px;
    font-size: 16px;
    color: rgba(0,0,0,0.65);
    border-bottom: 1px solid rgba(0,0,0,0.16);
    font-weight: bold;
  }
  .lr-box__center{
    width: 100%;
    position: absolute;
    top: 36px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .lr-box__content{
    padding: 16px;
  }
}
</style>
