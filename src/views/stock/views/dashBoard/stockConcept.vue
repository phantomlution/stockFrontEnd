<template>
  <el-popover >
    <div style="width: 720px">
      <lr-list :data="list" max-height="300px">
        <template slot="table-column">
          <el-table-column label="概念" prop="name" width="100px">
            <template slot-scope="scope">
              <el-link :underline="false" size="mini" :type="scope.row.type">{{ scope.row.name }}</el-link>
            </template>
          </el-table-column>
          <el-table-column label="股票列表">
            <template slot-scope="scope">
              <div class="lr-stock-concept__name">
                <el-tag v-for="item of scope.row.list" :key="item.code">{{ item.name }}</el-tag>
              </div>
            </template>
          </el-table-column>
        </template>
      </lr-list>
    </div>
    <el-button slot="reference">概念项</el-button>
  </el-popover>
</template>

<script>
import lodash from 'lodash'

// 指定一个低优先级的概念集合，尝试将这些概念排列在底部
const lowPriorityThemeList = [
  "标普概念", "富时概念", "沪股通", "融资融券", "上证380",
  "证金持股", "中证500", "转债标的", "股权激励", "深股通",
  "昨日连板", "昨日涨停", "深成500", "券商信托", "深证100R",
  "参股保险", "参股券商", '长江三角', '浙江板块', '广东板块',
  '山东板块', '北京板块', '辽宁板块', 'HS300_', '新疆板块',
  '重庆板块', '宁夏板块', '甘肃板块', '贵州板块', '湖南板块'
]

export default {
  computed: {
    list() {
      // 计算概念列表
      const stockPoolList = this.$store.getters.stockPoolList

      // 按照 主题 - 股票个数 进行排序
      const cache = new Map()
      stockPoolList.forEach(item => {
        if (item.base.type !== 'stock') {
          return
        }

        item.base.theme_list.forEach(theme => {
          theme = theme.trim()
          if (!cache.has(theme)) {
            cache.set(theme, {
              name: theme,
              list: []
            })
          }
          cache.get(theme)['list'].push({
            code: item.code,
            name: item.name
          })
        })
      })

      const themeList = lodash.sortBy([...cache.values()], function(item){return item.list.length})
      themeList.reverse()

      const result = []
      const normalThemeList = []
      const lowThemeList = []
      themeList.forEach(item => {
        if (lowPriorityThemeList.indexOf(item.name) === -1) {
          item.type = 'danger'
          normalThemeList.push(item)
        } else {
          item.type = 'info'
          lowThemeList.push(item)
        }
      })

      Array.prototype.push.apply(result, normalThemeList)
      Array.prototype.push.apply(result, lowThemeList)

      cache.clear()
      return result
    }
  }
}
</script>

<style lang="scss">
.lr-stock-concept__name{
  .el-tag {
    margin-right: 8px;
  }
}
</style>
