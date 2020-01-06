<!-- 通用列表视图 -->
<template>
  <div tabindex="-1" @keydown.up.prevent="toPrevious" @keydown.down.prevent="toNext">
    <div>
      <el-radio-group v-model="viewType">
        <el-radio-button label="table">table</el-radio-button>
        <el-radio-button label="card">card</el-radio-button>
      </el-radio-group>
    </div>
    <!-- table view -->
    <div v-show="viewType === 'table'">
      <el-table :data="data">
        <slot name="table" />
      </el-table>
    </div>

    <!-- card view -->
    <div v-show="viewType === 'card'" style="display: flex">
      <div style="flex: 1">
        <slot name="card" :item="currentItem" v-show="currentItem"/>
      </div>
      <!-- 右侧操作区 -->
      <div v-if="data.length > 0">
        <div v-if="data.length > 0 && currentIndex !== -1">
          {{ currentIndex + 1 }}/{{ data.length }}
        </div>
        <!--<div style="margin-top: 8px" v-if="analyzeCount > 0">-->
          <!--<el-button circle icon="el-icon-refresh" @click.stop="reAnalyze"></el-button>-->
        <!--</div>-->
        <div style="margin-top: 8px">
          <el-button :disabled="!hasPrevious" circle icon="el-icon-arrow-up" @click.stop="toPrevious"></el-button>
        </div>
        <div style="margin-top: 8px">
          <el-button :disabled="!hasNext" circle icon="el-icon-arrow-down" @click.stop="toNext"></el-button>
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
  }
}

export default {
  name: 'LrList',
  props,
  data() {
    return {
      currentIndex: 0,
      viewType: 'table' // or card
    }
  },
  computed: {
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
  }
}
</script>
