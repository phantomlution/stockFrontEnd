<template>
  <div class="lr-live-item" :class="{ 'lr-live-item--important': item.isImportant }">
    <template v-if="item.macro">
      <el-card>
        <h3>
          <el-link :underline="false" style="margin-right: 8px" @click.stop="openCustomEventDialog(item)"><i class="el-icon-paperclip" /></el-link>
          <span v-html="item.title"></span>
        </h3>
        <p>
          <span>前值: {{ item.former }}</span>
          <el-divider direction="vertical"></el-divider>
          <span>预测值: {{ item.predict }}</span>
          <el-divider direction="vertical"></el-divider>
          <span>实际值: {{ item.current }}</span>
        </p>
      </el-card>
    </template>
    <template v-else>
      <div style="display: flex">
        <div style="flex: 1">
          <el-link :underline="false" style="margin-right: 8px" @click.stop="openCustomEventDialog(item)"><i class="el-icon-paperclip" /></el-link>
          <span v-html="item.title"></span>
        </div>
        <div v-if="item.imageList" style="margin-left: 32px;">
          <el-image style="max-width: 96px;max-height: 72px" :data-src="url" :src="url" :preview-src-list="[url]" v-for="url of item.imageList" :key="url"></el-image>
        </div>
      </div>

    </template>
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
  methods: {
    openCustomEventDialog(item) {
      // TODO 宏观数据html生成
      this.$bus.$emit('openCustomEventDialog', {
        content: item.title,
        time: item.timestamp,
        url: item.url
      })
    },
    markRead() {
      return Promise.resolve()
    }
  }
}
</script>

<style lang="scss">
.lr-live-item h3{
  margin-top: 0;
}
.lr-live-item--important{
  color: red;
  .el-card{
    color: inherit;
  }
}
</style>
