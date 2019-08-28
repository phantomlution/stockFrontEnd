<template>
  <lr-box label="主题列表">
    <el-tag v-for="(item, itemIndex) of themeTagList" :key="itemIndex">{{ item }}</el-tag>
  </lr-box>
</template>

<script>
export default {
  data() {
    return {
      themeTagList: [],
      themeRuleList: [{ // 概念分片
        ruleName: '指数类',
        ruleThemeList: [
          'HS300_', 'MSCI大盘', 'MSCI中国', '上证180_', '上证50_',
          'MSCI中盘', '中证500', '上证380', '深成500', '深证100R'
        ],
        itemList: []
      }, {
        ruleName: '地区类',
        ruleThemeList: [
          '上海板块', '吉林板块', '广东板块', '湖北板块', '北京板块',
          '雄安新区', '安徽板块', '皖江区域', '山东板块', '河南板块',
          '长江三角', '浙江板块', '云南板块', '深圳特区', '黑龙江',
          '成渝特区', '四川板块', '江西板块', '江苏板块', '新疆板块',
          '陕西板块', '甘肃板块', '贵州板块', '青海板块', '山西板块',
          '辽宁板块', '湖南板块', '河北板块', '海南板块', '西藏板块',
          '广西板块', '内蒙古', '福建板块', '滨海新区', '重庆板块',
          '宁夏板块'
        ],
        itemList: []
      }, {
        ruleName: '噪声',
        ruleThemeList: [
          '沪股通', '机构重仓', '中字头', 'IPO受益', '分拆预期',
          '昨日连板', '昨日涨停', '昨日触板', '送转预期', '高送转',
          '深股通', '创业板综', '创业成份', '创业板壳',
        ],
        itemList: []
      }]
    }
  },
  mounted() {
    this.loadTheme()
  },
  methods: {
    loadTheme() {
      const themeMap = new Map()
      this.$http.get('/api/stock/theme').then(raw => {
        raw.forEach(theme => {
          const stockCode = theme.code
          theme.theme.forEach(themeName => {
            if (!themeMap.has(themeName)) {
              themeMap.set(themeName, [])
            }
            const themeStockList = themeMap.get(themeName)
            if (themeStockList.indexOf(stockCode) === -1) {
              themeStockList.push(stockCode)
            }
          })
        })
        console.log(themeMap)
        this.generateThemeTagList(themeMap)
      }).catch(_ => {
        console.error(_)
      })
    },
    generateThemeTagList(themeMap) {
      const uncategoryThemeList = []
      for (let themeName of themeMap.keys()) {
        let gotcha = false
        for(let i=0; i<this.themeRuleList.length; i++) {
          const currentThemeRule = this.themeRuleList[i]
          if (currentThemeRule.ruleThemeList.indexOf(themeName) !== -1) {
            gotcha = true
            currentThemeRule.itemList.push(themeName)
          } else if (!gotcha && i === this.themeRuleList.length - 1) {
            uncategoryThemeList.push(themeName)
          }
        }
      }
      this.themeTagList = uncategoryThemeList
    }
  }
}

</script>
