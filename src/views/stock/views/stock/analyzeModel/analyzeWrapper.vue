<!-- 复用通用的分析区域 -->
<template>
  <div style="display: flex;min-height: 64px" v-loading="loading">
    <!-- left -->
    <div style="flex: 1">
      <!-- params -->
      <div>
        <div style="display: flex">
          <!-- 表格视图 -->
          <div>
            <el-popover placement="left" v-model="showTable">
              <div style="width: 500px">
                <el-table v-if="showTable" :data="itemList" maxHeight="300px">
                  <el-table-column label="代码" width="150px">
                    <template slot-scope="scope">
                      <lr-stock-detail-link :add="false" :code="scope.row.code" :name="scope.row.name" />
                    </template>
                  </el-table-column>
                  <el-table-column label="主题">
                    <template slot-scope="scope">
                      <div class="lr-analyze-wrapper--theme">
                        <el-tag v-for="(theme, themeIndex) of scope.row.themeList" :key="themeIndex">
                          {{ theme }}
                        </el-tag>
                      </div>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
              <el-link :underline="false" slot="reference" style="margin-top: 5px;margin-right: 8px">
                <template v-if="showTable">
                  <i class="el-icon-d-arrow-left" />
                </template>
                <template v-else>
                  <i class="el-icon-d-arrow-right" />
                </template>
              </el-link>
            </el-popover>
          </div>
          <div style="flex: 1">
            <slot name="params"></slot>
          </div>
        </div>
      </div>
      <!-- current -->
      <div v-if="currentRowModel">
        <!-- base -->
        <div style="margin-bottom: 8px">
          <lr-stock-detail-link :add="true" :code="currentRowModel.code" :name="currentRowModel.name" />
        </div>
        <!-- desc -->
        <div v-if="currentRowModel.desc">
          <pre style="white-space: pre-line;">{{ currentRowModel.desc }}</pre>
        </div>
        <!-- theme -->
        <div v-if="currentRowModel.themeList && currentRowModel.themeList.length > 0" class="lr-analyze-wrapper--theme">
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
      showTable: false,
      analyzeCount: 0,
      loading: false,
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
    updateStockList(stockList) {
      return Promise.resolve()
//      return this.$http.post(`/api/analyze/stock/list`, stockList)
    },
    startAnalyze() {
      if (this.loading) {
        return
      }
      this.itemList = []
      this.currentRowIndex = -1

      this.loading = true
      this.analyzePromise().then(rawList => {
        const itemList = this.normalization(rawList)
        // 更新数据库代码表
        const stockList = itemList.map(item => {
          return {
            code: item.code,
            name: item.name
          }
        })

        this.itemList = itemList

        this.updateStockList(stockList).then(_ => {
          this.loading = false
          if (this.itemList.length > 0) {
            this.analyzeCount += 1
            this.toNext()
          } else {
            return this.$message.warning('无任何数据')
          }
        }).catch(_ => {
          this.loading = false
          this.$message.error('数据更新失败')
          console.error(_)
        })
      }).catch(_ => {
        this.loading = false
        this.$message.error('读取数据失败')
        console.error(_)
      })
    },
    normalization(itemList) { // 对齐数据
      // 暂时剔除创业板
      const result = itemList.filter(item => {
        return item.code.indexOf('SZ300') === -1
      })

      // 追加概念板块信息(仅仅从本地缓存读取数据)
      const stockMap = this.$store.state.data.stockMap
      result.forEach(item => {
        if (stockMap.has(item.code)) {
          const stock = stockMap.get(item.code)
          item.themeList = stock.base.theme_list || []
        }
      })

      return result
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

<style lang="scss">
.lr-analyze-wrapper--theme{
  margin-top: -8px;
  .el-tag{
    margin-top: 8px;
    margin-right: 8px;
  }
}
</style>
