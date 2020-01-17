<template>
  <div class="lr-financial-calendar--item" :style="containerStyle">
    <div class="lr-financial-calendar--item--time">
      <span>{{ item.time }}</span>
    </div>
    <div style="flex: 1" :style="itemStyle">
      {{ item.name }}
    </div>
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
  computed: {
    containerStyle() {
      const style = {}
      if (this.item.notify) {
        style['background'] = '#fdf6ec'
      }
      return style
    },
    itemStyle() {
      const style = {}
      if (this.item.importantLevel === '3') {
        style['color'] = 'red'
      }
      return style
    }
  }
}
</script>

<style lang="scss">
.lr-financial-calendar--item{
  display: flex;
  border: 1px solid #EBEEF5;
  background-color: #FFF;
  color: #303133;
  transition: .3s;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
  padding: 8px 12px;
  & + .lr-financial-calendar--item{
    margin-top: 8px;
  }
}

.lr-financial-calendar--item--time{
  width: 64px;
}

</style>
