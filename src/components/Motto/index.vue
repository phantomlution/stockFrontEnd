<template>
  <div class="lr-motto__wrapper">
    <div class="lr-motto__content el-message--warning">
      <div class="el-message__content">
        <div :style="containerStyle">
          <slot />
        </div>
      </div>
      <div class="lr-motto__button" v-if="useCollapse">
        <div class="lr-motto__button--collapse" v-if="!collapse">
          <i class="el-icon-arrow-right" @click.stop="collapse = !collapse"></i>
        </div>
        <div class="lr-motto__button--expand" v-if="collapse">
          <i class="el-icon-arrow-down" @click.stop="collapse = !collapse"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const props = {
  collapseHeight: {
    type: Number,
    default: 14
  },
  useCollapse: {
    type: Boolean,
    default: false
  }
}
export default {
  name: 'LrMotto',
  props,
  data() {
    return {
      collapse: false
    }
  },
  computed: {
    containerStyle() {
      if (this.useCollapse && this.collapse) {
        return {
          height: `${this.collapseHeight}px`,
          overflow: 'hidden'
        }

      }
      return {}
    }
  }
}
</script>

<style lang="scss">
.lr-motto__wrapper{
  position: relative;
  & + .lr-motto__wrapper{
    margin-top: 8px;
  }
}
.lr-motto__content{
  width: 100%;
  box-sizing: border-box;
  border-width: 1px;
  border-style: solid;
  padding: 15px 28px 15px 28px;
  display: flex;
  align-items: center;

}

.lr-motto__button{
  position: absolute;
  left: 10px;
  top: 11px;
  i {
    font-size: 13px;
    font-weight: 300;
    color: #303133;
    &:hover{
      cursor: pointer;
      opacity: 0.8;
    }
  }
}
</style>
