<!-- 复用通用的分析区域 -->
<template>
  <div style="display: flex">
    <!-- left -->
    <div style="flex: 1">
      <!-- params -->
      <div>
        <slot name="params"></slot>
      </div>
      <!-- current -->
      <div v-if="currentRowModel">
        <!-- base -->
        <div>
          <lr-stock-detail-link :add="true" :code="currentRowModel.code" :name="currentRowModel.name" />
        </div>
        <!-- desc -->
        <div v-if="currentRowModel.desc">
          <pre style="white-space: pre-line;">{{ currentRowModel.desc }}</pre>
        </div>
        <!-- theme -->
        <div v-if="currentRowModel.themeList && currentRowModel.themeList.length > 0">
          <el-tag v-for="(theme, themeIndex) of currentRowModel.themeList" :key="themeIndex">
            {{ theme }}
          </el-tag>
        </div>
        <!-- date -->
        <div v-if="currentRowModel.list">
          <div v-for="(item, itemIndex) of currentRowModel.list">
            {{ item }}<el-button type="text" @click.stop="showDetailItem(item)">查看</el-button>
          </div>
        </div>
      </div>
      <div v-if="analyzeCount === 0">
        <el-button type="primary" @click.stop="startAnalyze">开始分析</el-button>
      </div>
    </div>
    <!-- right -->
    <div v-if="itemList.length > 0">
      <div v-if="itemList.length > 0 && currentRowIndex !== -1">
        {{ currentRowIndex + 1 }}/{{ itemList.length }}
      </div>
      <div style="margin-top: 8px" v-if="analyzeCount > 0">
        <el-button circle icon="el-icon-refresh" @click.stop="reAnalyze"></el-button>
      </div>
      <div style="margin-top: 8px">
        <el-button circle icon="el-icon-arrow-up" @click.stop="toPrevious"></el-button>
      </div>
      <div style="margin-top: 8px">
        <el-button circle icon="el-icon-arrow-down" @click.stop="toNext"></el-button>
      </div>
    </div>
  </div>
</template>

<script>
const props = {
  analyzePromise: {
    type: Function,
    required: true
  }
}

export default {
  props,
  data() {
    return {
      analyzeCount: 0,
      currentRowIndex: -1,
      currentRowModel: null,
      itemList: []
    }
  },
  watch: {
    currentRowModel(model) {
      if (model) {
        this.showDetail()
      }
    },
    currentRowIndex(val) {
      if (val >= 0 && val < this.itemList.length) {
        this.currentRowModel = this.itemList[val]

      } else {
        this.currentRowModel = null
      }
    }
  },
  methods: {
    reAnalyze() {
      this.startAnalyze()
    },
    startAnalyze() {
      this.itemList = []
      this.currentRowIndex = -1

      this.analyzePromise().then(rawList => {
        this.itemList = this.normalization(rawList)
        if (this.itemList.length > 0) {
          this.analyzeCount += 1
          this.toNext()
        } else {
          return this.$message.warning('无任何数据')
        }
      }).catch(_ => {
        this.$message.error('读取数据失败')
        console.error(_)
      })
    },
    normalization(itemList) { // 对齐数据
      return itemList
    },
    setRowIndex(index) {
      this.currentRowIndex = index
    },
    toPrevious() {
      if (this.currentRowIndex === 0) {
        return this.$message.warning('已经是第一条了')
      } else if (this.currentRowIndex < this.itemList.length) {
        this.currentRowIndex -= 1
      }
    },
    toNext() {
      if (this.currentRowIndex === this.itemList.length - 1) {
        return this.$message.warning('已经是最后一条了')
      } else {
        this.currentRowIndex += 1
      }
    },
    showDetailItem(item) {
      this.showDetail({
        date: item.date
      })
    },
    showDetail(item = {}) {
      if (!this.currentRowModel) {
        return this.$message.warning('没有选择数据')
      }
      const model = {
        code: this.currentRowModel.code
      }
      Object.assign(model, item)
      this.$bus.$emit('searchStockDetail', model)
    }
  }
}
</script>
