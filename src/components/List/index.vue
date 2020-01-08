<!-- 通用列表视图 -->
<template>
  <div class="lr-list" tabindex="-1" @keydown.up.prevent="toPrevious" @keydown.down.prevent="toNext" @keydown.left.prevent="hideAction" @keydown.right.prevent="showAction">
    <div style="display: flex">
      <!-- 左侧 -->
      <div style="flex: 1">
        <div v-show="actionVisible">
          <slot name="action"></slot>
        </div>
        <!-- content -->
        <div>
          <!-- table view -->
          <div v-show="viewType === 'table'">
            <el-table :data="data" :maxHeight="maxHeight">
              <slot name="table-column" />
            </el-table>
          </div>

          <!-- card view -->
          <div v-show="viewType === 'card'" style="display: flex">
            <div style="flex: 1">
              <slot name="card" :row="currentItem" v-if="currentItem" />
            </div>
        </div>
      </div>
      </div>
      <!-- 右侧 -->
      <div>
        <div style="margin-bottom: 8px" v-if="showChangeViewButton">
          <el-radio-group v-model="viewType">
            <el-radio-button label="table"><i class="el-icon-tickets"></i></el-radio-button>
            <el-radio-button label="card"><i class="el-icon-reading"></i></el-radio-button>
          </el-radio-group>
        </div>
        <div v-if="viewType === 'card' && data.length > 0">
          <div v-if="data.length > 0 && currentIndex !== -1" class="lr-list--button">
            {{ currentIndex + 1 }}/{{ data.length }}
          </div>
          <div class="lr-list--button">
            <el-button :disabled="!hasPrevious" circle icon="el-icon-arrow-up" @click.stop="toPrevious"></el-button>
          </div>
          <div class="lr-list--button">
            <el-button :disabled="!hasNext" circle icon="el-icon-arrow-down" @click.stop="toNext"></el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
/**
 * 键盘按键事件顺序:
 * 1. keydown
 * 2. 浏览器默认行为
 * 3. keyup
 */

const props = {
  data: {
    type: Array,
    required: true
  },
  maxHeight: {
    type: String,
    default: ''
  }
}

export default {
  name: 'LrList',
  props,
  data() {
    return {
      currentIndex: 0,
      actionVisible: true,
      viewType: 'card'
    }
  },
  mounted() {
    if (!this.hasCardView & this.hasTableView) {
      this.viewType = 'table'
    }
  },
  computed: {
    hasTableView() { // 是否传入 table-column slot
      return !!this.$slots['table-column']
    },
    hasCardView() { // 是否传入 card slot
      return !!this.$slots['card']
    },
    showChangeViewButton() { // 是否显示切换视图按钮
      return this.hasTableView & this.hasCardView
    },
    isEmpty() {
      return this.data.length === 0
    },
    hasPrevious() {
      return !this.empty && (this.currentIndex - 1 >= 0)
    },
    hasNext() {
      return !this.empty && (this.currentIndex + 1 <this.data.length)
    },
    currentItem() {
      if (this.currentIndex === -1) {
        return null
      }
      return this.data[this.currentIndex]
    }
  },
  watch: {
    currentItem(val) {
      this.$emit('change', val)
    }
  },
  methods: {
    toPrevious() {
      if (this.hasPrevious) {
        this.currentIndex -= 1
      }
    },
    toNext() {
      if (this.hasNext) {
        this.currentIndex += 1
      }
    },
    showAction() { // 隐藏 slot-action
      this.actionVisible = true
    },
    hideAction() {
      this.actionVisible = false
    }
  }
}
</script>

<style lang="scss">
.lr-list{
  width: 100%;
  &:focus{
    outline: none;
  }
  .el-radio-button__inner{
    padding: 7px;
  }
}

.lr-list--button{
  margin-bottom: 8px;
  text-align: right;
}
</style>
