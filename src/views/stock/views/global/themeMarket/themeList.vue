<template>
  <div :id="theme.containerId" style="padding-top: 8px;">
    <el-divider>{{ theme.name }}(共<span style="color: red">{{ theme.list.length }}</span>个)</el-divider>
    <div class="lr-theme-item__wrapper">
      <div class="lr-theme-item" v-for="(item, itemIndex) of theme.list" :key="itemIndex">
        <div class="lr-theme-item__label" @click.stop="showTheme(item)">{{ item.name }}</div>
        <div class="lr-theme-item__count">{{ item.list.length }}</div>
      </div>
    </div>
  </div>
</template>

<script>
const props = {
  theme: {
    type: Object,
    required: true
  }
}
export default {
  props,
  methods: {
    showTheme(item) {
      this.$emit('showTheme', item)
    }
  }
}
</script>

<style lang="scss">
.lr-theme-item__wrapper{
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-row-gap: 24px;
  grid-column-gap: 24px;
}
.lr-theme-item{
  padding: 8px 16px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 13px 0 rgba(0, 0, 0, 0.06);
  &:hover{
    cursor: pointer;
  }
}

.lr-theme-item__label{
  flex: 1;
  font-size: 16px;

}

.lr-theme-item__count{
  font-size: 14px;
  color: rgba(0, 0, 0, 0.65);
}
</style>
