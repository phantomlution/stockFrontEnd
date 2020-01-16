<!-- 复用通用的分析区域 -->
<template>
  <div style="display: flex;min-height: 64px" v-loading="loading">
    <lr-list :data="itemList" max-height="500px" @change="change">
      <div slot="action">
        <div style="display: flex">
          <div style="width: 100%">
            <el-button type="primary" @click.stop="startAnalyze">开始分析</el-button>
            <slot name="params"></slot>
          </div>
        </div>
      </div>
      <!-- table view -->
      <template slot="table-column">
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
      </template>
      <!-- card view -->
      <template slot="card" slot-scope="scope">
        <!-- base -->
        <div style="margin-bottom: 8px">
          <lr-stock-detail-link :add="true" :code="scope.row.code" :name="scope.row.name" />
        </div>
        <!-- desc -->
        <div v-if="scope.row.desc">
          <pre style="white-space: pre-line;">{{ scope.row.desc }}</pre>
        </div>
        <!-- theme -->
        <div v-if="scope.row.themeList && scope.row.themeList.length > 0" class="lr-analyze-wrapper--theme">
          <el-tag v-for="(theme, themeIndex) of scope.row.themeList" :key="themeIndex">
            {{ theme }}
          </el-tag>
        </div>
        <!-- date -->
        <div v-if="scope.row.list">
          <div v-for="(item, itemIndex) of scope.row.list">
            {{ item }}<el-button type="text" @click.stop="showDetailItem(item)">查看</el-button>
          </div>
        </div>
      </template>
    </lr-list>
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
      loading: false,
      itemList: [],
      current: null,
    }
  },
  methods: {
    reAnalyze() {
      this.startAnalyze()
    },
    updateStockList(itemList) { // 同步股票代码到分析池中
      const stockList = itemList.map(item => {
        return {
          code: item.code,
          name: item.name
        }
      })
      return Promise.resolve()
//      return this.$http.post(`/api/analyze/stock/list`, stockList)
    },
    startAnalyze() {
      if (this.loading) {
        return
      }

      this.itemList = []
      this.loading = true
      this.analyzePromise().then(rawList => {
        console.log(rawList)
        this.loading = false
        this.itemList = this.normalization(rawList)
      }).catch(_ => {
        this.loading = false
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
    showDetailItem(item) {
      this.showDetail({
        date: item.date
      })
    },
    change(item) {
      this.current = item
      this.showDetail()
    },
    showDetail(item = {}) {
      if (!this.current) {
        return this.$message.warning('没有选择数据')
      }
      const model = {
        code: this.current.code
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
