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
              <pre style="white-space: pre-line;">{{ currentRowModel.desc }}</pre>
            </div>
            <!-- 自定义分析 -->
            <div v-if="currentRowModel.list">
              <div v-for="(item, itemIndex) of currentRowModel.list">
                {{ item }}<el-button type="text" @click.stop="customAnalyze(item)">查看</el-button>
              </div>
            </div>
          </div>
          <div style="margin: 0 16px;" v-if="currentRowModel.closeMaxIncrement">
            <div class="lr-make-short-table-label">低于最高：{{ currentRowModel.closeMaxIncrement }}%</div>
            <div class="lr-make-short-table-label">高于最低：{{ currentRowModel.closeMinIncrement }}%</div>
          </div>
          <div>
            <div><el-button type="text" @click.stop="toPrevious">上一条</el-button></div>
            <div><el-button type="text" @click.stop="toNext">下一条</el-button></div>
            <div>
              <el-popover>
                <div>
                  <div>
                    <el-input-number :min="0" :max="dataList.length - 1" v-model="jumpIndex" />
                  </div>
                  <div style="text-align: right">
                    <el-button @click.stop="toCustom" >确定</el-button>
                  </div>
                </div>
                <el-button type="text" slot="reference">跳转</el-button>
              </el-popover>

            </div>
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
  props: {
    fragmentDealToken: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      currentRowModel: null,
      currentRowIndex: -1,
      jumpIndex: '',
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
    toCustom() {
      const jumpIndex = this.jumpIndex
      this.setRowIndex(jumpIndex)
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
      const highlight = []
      this.currentRowModel.list = this.currentRowModel.list || []
      if (this.currentRowModel.list.length > 0) {
        this.currentRowModel.list.forEach(item => {
          highlight.push({
            date: item.date,
            timestamp: this.$moment(item.date).toDate().getTime()
          })
        })
      }
      this.$emit('showDetail', {
        code,
        highlight
      })

      // 自动触发分析
      setTimeout(_ => {
        if (this.currentRowModel.list.length > 0) {
          this.customAnalyze(this.currentRowModel.list[0])
        }
      }, 300)

    },
    customAnalyze(item) {
      if (this.fragmentDealToken) {
        item.code = this.currentRowModel.code
        this.$bus.$emit(this.fragmentDealToken, item)
      }
    }
  }
}
</script>
