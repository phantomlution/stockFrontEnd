<template>
  <lr-stick-bar title="选股助手" width="600" top="128px">
    <div>
      <div style="display: flex">
        <template v-if="currentRowModel">
          <div style="flex: 1">
            <div style="margin-bottom: 8px">
                <span style="font-weight: bold;font-size: 16px">
                  <lr-stock-detail-link :add="true" :code="currentRowModel.code" :name="currentRowModel.name" />
                  &nbsp;
                  <template v-if="currentRowIndex !== -1">
                    {{ currentRowIndex + 1 }}/{{ dataList.length }}
                  </template>
                </span>
            </div>
            <div v-if="currentRowModel.themeList && currentRowModel.themeList.length > 0">
              <el-tag v-for="(theme, themeIndex) of currentRowModel.themeList" :key="themeIndex">
                {{ theme }}
              </el-tag>
            </div>
            <div v-if="currentRowModel.desc">
              <pre>{{ currentRowModel.desc }}</pre>
            </div>
          </div>
          <div style="margin: 0 16px;" v-if="currentRowModel.closeMaxIncrement">
            <div class="lr-make-short-table-label">低于最高：{{ currentRowModel.closeMaxIncrement }}%</div>
            <div class="lr-make-short-table-label">高于最低：{{ currentRowModel.closeMinIncrement }}%</div>
          </div>
          <div>
            <div><el-button type="text" @click.stop="toPrevious">上一条</el-button></div>
            <div><el-button type="text" @click.stop="toNext">下一条</el-button></div>
          </div>
        </template>
        <template v-else>
          <div style="display: flex;justify-content: center;align-items: center;width: 100%;">
            <el-button type="primary" @click.stop="setRowIndex(0)">查看第一条</el-button>
            <el-button type="primary" @click.stop="getCurrentCustomSource">当前自定义数据源</el-button>
            <el-button type="primary" @click.stop="getFileResource">其他数据源</el-button>
          </div>
        </template>
      </div>
    </div>
  </lr-stick-bar>
</template>

<script>
export default {
  data() {
    return {
      currentRowModel: null,
      currentRowIndex: -1,
      dataList: []
    }
  },
  watch: {
    currentRowIndex(val) {
      if (val >= 0 && val < this.dataList.length) {
        this.currentRowModel = this.dataList[val]
        this.showDetail(this.currentRowModel.code)
      } else {
        this.currentRowModel = null
      }

    }
  },
  methods: {
    init(dataList) {
      this.dataList = dataList
      this.currentRowIndex = -1
    },
    setRowIndex(index) {
      this.currentRowIndex = index
    },
    toPrevious() {
      if (this.currentRowIndex === 0) {
        return this.$message.warning('已经是第一条了')
      } else if (this.currentRowIndex < this.dataList.length) {
        this.currentRowIndex -= 1
      }
    },
    toNext() {
      if (this.currentRowIndex === this.dataList.length - 1) {
        return this.$message.warning('已经是最后一条了')
      } else {
        this.currentRowIndex += 1
      }
    },
    getCurrentCustomSource() {
      return this.$http.get('/api/analyze/custom').then(response => {
        this.init(response)
        this.$nextTick(_ => {
          this.toNext()
        })
      }).catch(_ => {
        console.error(_)
      })
    },
    getFileResource() { // 加载其他数据源
      const baseDir = '/api/static/analyze/'
      const fileName = '二次限售解禁分析.json'

      return this.getRemoteFile(baseDir + fileName).then(response => {
        this.init(response)
        this.$nextTick(_ => {
          this.toNext()
        })
      }).catch(_ => {
        console.error(_)
      })
    },
    getRemoteFile(filePath) { // 读取远程文件
      return this.$http.get(filePath)
    },
    showDetail(code) {
      this.$emit('showDetail', code)
    }
  }
}
</script>
