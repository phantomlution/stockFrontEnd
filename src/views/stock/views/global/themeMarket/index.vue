<template>
  <el-drawer title="主题市场" :visible.sync="visible" size="80%" direction="ltr">
    <div slot="title" style="display: flex;align-items: center">
      <div style="margin-right: 16px;">主题市场</div>
      <div v-if="themeList.length > 0">
        <span style="margin-left: 64px;font-size: 14px;color: grey">快速跳转:</span>
        <el-link style="margin-left: 16px;" type="primary" :href="`#${theme.containerId}`" v-for="theme of themeList" :key="theme.containerId">{{ theme.name }}</el-link>
      </div>
     </div>
    <div style="padding: 0 16px;">
      <el-row :gutter="32">
        <el-col :span="12">
          <el-card :style="cardStyle" v-loading="loading">
            <div v-if="!loading" style="margin-top: -10px">
              <theme-list :theme="theme" @showTheme="showTheme" v-for="theme of themeList" :key="theme.containerId"></theme-list>
            </div>
          </el-card>
        </el-col>
        <el-col :span="12">
          <el-card :style="cardStyle">
            <template v-if="currentTheme">
              <el-divider>{{ currentTheme.name }}(共<span style="color: red">{{ currentTheme.list.length }}</span>个)</el-divider>
              <div style="display: inline-block;width: 84px" :key="itemIndex" v-for="(item, itemIndex) of currentTheme.list">
                <lr-stock-detail-link :add="false" :showCode="false" :code="item.code" :name="item.name" />
              </div>
            </template>
            <template v-else>
              <el-divider>请选择主题</el-divider>
            </template>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </el-drawer>
</template>

<script>
import { idGenerator } from '@/utils'
import themeList from './themeList.vue'

export default {
  components: {
    themeList
  },
  data() {
    return {
      visible: false,
      height: 'calc(100vh - 90px)',
      loading: true,
      activeName: '1',
      currentTheme: null,
      themeList: [],
      defaultThemeRuleName: '核心主题',
      themeRuleList: [{ // 概念分片
        ruleName: '指数类',
        ruleThemeList: [
          'HS300_', 'MSCI大盘', 'MSCI中国', '上证180_', '上证50_',
          'MSCI中盘', '中证500', '上证380', '深成500', '深证100R',
          '央视50_'
        ]
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
        ]
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
          "网络游戏", "转债标的", "乡村振兴", "金属制品",
          "北斗导航", "无人机", "煤炭采选", "商业百货", "新零售",
          "铁路基建", "社保重仓", "垃圾分类", "塑胶制品", "玻璃陶瓷",
          "参股360", "赛马概念", "文教休闲", "百度概念", "免疫治疗",
          "地热能", "工业大麻", "富士康", "油气设服", "装修装饰",
          "包装材料", "网红直播", "Facebook", "软件服务", "全息技术",
          "保险", "专用设备",  "水泥建材", "基因测序", "国产软件",
          "工艺商品",  "园林工程", "智能电视", "知识产权", "次新股",
          "数字中国", "食品安全"
        ]
      }]
    }
  },
  computed: {
    cardStyle() {
      return {
        'height': this.height,
        'overflow': 'auto'
      }
    }
  },
  watch: {
    visible(val) {
      if (!val) {
        this.currentTheme = null
      }
    }
  },
  beforeDestroy() {
    this.$bus.$off('openThemeMarket')
  },
  mounted() {
    this.$bus.$on('openThemeMarket', _ => {
      this.visible = true
      this.loadMarketTheme()
    })
  },
  methods: {
    loadMarketTheme() {
      this.loading = true
      this.$store.dispatch('getThemeList').then(themeMarketList => {
        // 初始化
        const themeMap = new Map()
        themeMap.set(this.defaultThemeRuleName, [])
        this.themeRuleList.forEach(themeRule => {
          themeMap.set(themeRule.ruleName, [])
        })

        themeMarketList.forEach(themeMarketItem => {
          let themeName = themeMarketItem['name']

          // 匹配对应的规则项
          let gotcha = false
          for(let i=0; i<this.themeRuleList.length; i++) {
            const currentThemeRule = this.themeRuleList[i]
            if (currentThemeRule.ruleThemeList.indexOf(themeName) !== -1) {
              themeMap.get(currentThemeRule.ruleName).push(themeMarketItem)
              gotcha = true
            }
          }

          if (!gotcha) {
            themeMap.get(this.defaultThemeRuleName).push(themeMarketItem)
          }
        })

        // 生成要展示的数据
        const themeList = []
        for(let themeRuleName of themeMap.keys()) {
          themeList.push({
            name: themeRuleName,
            containerId: idGenerator.next('theme_market'),
            list: themeMap.get(themeRuleName)
          })
        }
        this.themeList = themeList
        themeMap.clear()
        this.loading = false
      }).catch(_ => {
        console.error(_)
      })
    },
    showTheme(themeItem) {
      this.currentTheme = themeItem
    }
  }
}
</script>
