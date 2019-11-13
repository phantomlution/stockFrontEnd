<template>
  <div style="padding-right: 16px">
    <el-timeline>
      <el-timeline-item :timestamp="item.datetime" placement="top" :key="list._id" v-for="(item, itemIndex) of list">
        <el-card class="lr-column-card">
          <h4 v-html="item.content"></h4>
          <!--<div v-show="item.source">-->
            <!--<el-button type="text" @click.stop="showSource(item.source)">信息源</el-button>-->
          <!--</div>-->
        </el-card>
      </el-timeline-item>
    </el-timeline>
  </div>
</template>

<script>
import { deepClone } from '@/utils'


const props = {
  list: {
    type: Array,
    required: true
  }
}
export default {
  props,
  data() {
    return {
    }
  },
}
</script>

<style lang="scss">
.lr-column-card{
  .el-card__body{
    padding: 8px 16px 8px 16px;
    h4{
      margin: 0;
    }
    & > p{
      margin: 0;
      margin-top: 12px;
    }
  }

  & + .lr-column-card{
    margin-top: 8px;
  }
}

.lr-column-drawer{
  .el-drawer__body{
    overflow: auto;
  }
}
</style>
