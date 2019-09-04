<template>
  <div>
    <lr-box title="主题列表">
      <el-badge class="lr-theme-badge" :value="item.stockCodeList.length" v-for="(item, itemIndex) of displayThemeTagList" :key="itemIndex">
        <el-button size="small" @click.stop="showTheme(item)">{{ item.themeName }}</el-button>
      </el-badge>
    </lr-box>
    <lr-box title="主题趋势">
      <theme-trend ref="themeTrend"/>
    </lr-box>
    <lr-box :title="currentTheme" v-if="currentTheme" style="margin-top: 8px">
      <el-table :data="codeList">
        <el-table-column label="name" prop="label" />
        <el-table-column label="code" prop="value" />
      </el-table>
    </lr-box>
  </div>

</template>

<script>
import themeTrend from './themeTrend.vue'

export default {
  components: {
    themeTrend
  },
  data() {
    return {
      totalThemeTagList: [],
      displayThemeTagList: [],
      currentTheme: '',
      codeList: [],
      themeRuleList: [{ // 概念分片
        ruleName: '指数类',
        ruleThemeList: [
          'HS300_', 'MSCI大盘', 'MSCI中国', '上证180_', '上证50_',
          'MSCI中盘', '中证500', '上证380', '深成500', '深证100R',
          '央视50_'
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
          '宁夏板块', '天津板块', '京津冀', '长株潭'
        ],
        itemList: []
      }, {
        ruleName: '噪声',
        ruleThemeList: [ // '--' 为退市
          '沪股通', '机构重仓', '中字头', 'IPO受益', '分拆预期',
          '昨日连板', '昨日涨停', '昨日触板', '送转预期', '高送转',
          '深股通', '创业板综', '创业成份', '创业板壳', '预盈预增',
          'AH股', 'AB股', 'B股', '--', '银行', '高速公路',
          '民航机场', '钢铁行业', '公共事业', '新三板', '港口水运',
          '参股保险', '海洋经济', '通用航空', '参股期货', '交运设备',
          '沪企改革', '彩票概念', '工程建设', '租售同权', '综合行业',
          '多元金融', '健康中国', '家电行业', '股权转让', '造纸印刷',
          '纺织服装', '船舶制造', '海工装备', '生态农业', '木业家具',
          '珠宝首饰', '土地流转', '东北振兴', "富时概念", "融资融券",
          "证金持股", "创投", "QFII重仓", "国企改革", "粤港自贸",
          "汽车行业", "公用事业", "美丽中国", "迪士尼", "养老金",
          "参股银行", "股权激励", "航母概念", "预亏预减", "机械行业",
          "车联网", "基金重仓", "旅游酒店", "电商概念", "交运物流",
          "快递概念", "国际贸易", "酿酒行业", "化纤行业", "煤化工",
          "水利建设", "独角兽", "仪器仪表", "ST概念", "安防设备",
          "国家安防", "债转股", "电子信息", "高校", "军民融合",
          "网络游戏", "转债标的", "乡村振兴", "金属制品", "进口博览",
          "北斗导航", "无人机", "煤炭采选", "商业百货", "新零售",
          "铁路基建", "社保重仓", "垃圾分类", "塑胶制品", "玻璃陶瓷",
          "参股360", "赛马概念", "文教休闲", "百度概念", "免疫治疗",
          "地热能", "工业大麻", "富士康", "油气设服", "装修装饰",
          "包装材料", "网红直播", "Facebook", "软件服务", "全息技术",
          "保险", "专用设备",  "水泥建材", "基因测序", "国产软件",
          "工艺商品",  "园林工程", "智能电视", "知识产权", "次新股",
          "数字中国", "食品安全"
        ],
        itemList: []
      }]
    }
  },
  computed: {
    themeMap() {
      return this.$store.state.data.themeMap
    }
  },
  mounted() {
    this.loadTheme()
  },
  methods: {
    loadTheme() {
      const themeMap = this.themeMap
      themeMap.clear()
      const raw = this.$store.state.data.stockThemeList
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
      this.generateThemeTagList()
    },
    generateTotalThemeTagList() { // 生成所有的主题列表
      const codeList = this.$store.state.data.codeList
      const totalThemeTagList = []
      for(let themeName of this.themeMap.keys()) {
        totalThemeTagList.push({
          themeName,
          stockCodeList: this.themeMap.get(themeName).map(item => {
            const findItem = codeList.find(code => code.value === item)
            if (!findItem) {
              return {
                label: '',
                value: item
              }
            }
            return findItem
          }).filter(item => item.label)
        })
      }
      this.totalThemeTagList = totalThemeTagList
    },
    generateThemeTagList() {
      const themeMap = this.themeMap
      this.generateTotalThemeTagList()
      const defaultThemeList = []
      for (let themeName of themeMap.keys()) {
        let gotcha = false
        for(let i=0; i<this.themeRuleList.length; i++) {
          const currentThemeRule = this.themeRuleList[i]
          if (currentThemeRule.ruleThemeList.indexOf(themeName) !== -1) {
            gotcha = true
            currentThemeRule.itemList.push(themeName)
          } else if (!gotcha && i === this.themeRuleList.length - 1) {
            defaultThemeList.push(themeName)
          }
        }
      }
      console.log(defaultThemeList.join(','))
      this.displayThemeTagList = defaultThemeList.map(themeName => this.totalThemeTagList.find(item => item.themeName === themeName))
    },
    showTheme(themeItem) {
      const themeName = themeItem.themeName
      const stockCodeList = themeItem.stockCodeList

      this.currentTheme = themeName
      this.codeList = stockCodeList

      this.$refs.themeTrend.loadTrend(themeName, stockCodeList)
    }
  }
}

</script>

<style lang="scss">
.lr-theme-badge{
  margin-right: 40px;
  margin-bottom: 16px;
}
</style>
