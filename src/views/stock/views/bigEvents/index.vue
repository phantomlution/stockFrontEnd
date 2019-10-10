<template>
  <div>
    <!--<financial-information />-->
    <el-radio-group v-model="eventTab" style="width: 100%;text-align: center;margin-bottom: 16px">
      <el-radio-button label="mine">我的日历</el-radio-button>
      <el-radio-button label="official">财经事件数据源</el-radio-button>
      <el-radio-button label="fastNews">7*24</el-radio-button>
      <el-radio-button label="centralBankOperation">央行操作</el-radio-button>
      <el-radio-button label="shibor">shibor</el-radio-button>
      <el-radio-button label="loanPrimeRate">LPR</el-radio-button>
      <el-radio-button label="央行官方新闻">央行官方新闻</el-radio-button>
      <el-radio-button label="CNBC">CNBC</el-radio-button>
      <el-radio-button label="新华网">新华网</el-radio-button>
      <el-radio-button label="外交部">外交部</el-radio-button>
      <el-radio-button label="发改委">发改委</el-radio-button>
    </el-radio-group>

    <div>
      <div v-show="eventTab === 'mine'">
        <ongoing />
        <eventCalendar />
      </div>
      <div v-if="eventTab === 'official'">
        <lr-link-page :src="officialSrc"/>
      </div>
      <div v-if="eventTab === 'fastNews'">
        <lr-link-page src="http://kx.fx678.com" />
      </div>
      <div v-if="eventTab === 'centralBankOperation'">
        <lr-link-page src="http://www.chinamoney.com.cn/chinese/scggyhywgg/" />
      </div>
      <div v-if="eventTab === 'shibor'">
        <lr-link-page src="http://www.chinamoney.com.cn/chinese/bkshibor/" />
      </div>
      <div v-if="eventTab === 'loanPrimeRate'">
        <lr-link-page src="http://www.chinamoney.com.cn/chinese/bklpr/" />
      </div>
      <div v-if="eventTab === 'CNBC'">
        <lr-link-page src="https://www.cnbc.com" :skipLoading="true" />
      </div>
      <div v-if="eventTab === '新华网'">
        <lr-link-page src="http://www.xinhuanet.com" />
      </div>
      <div v-if="eventTab === '外交部'">
        <lr-link-page :redirect="true" src="https://www.fmprc.gov.cn/web/fyrbt_673021/dhdw_673027/" />
      </div>
      <div v-if="eventTab === '央行官方新闻'">
        <lr-link-page src="http://www.pbc.gov.cn/goutongjiaoliu/113456/113469/11040/index1.html" />
      </div>
      <div v-if="eventTab === '发改委'">
        <lr-link-page src="http://www.ndrc.gov.cn/" />
      </div>
    </div>
  </div>
</template>

<script>
import eventCalendar from './eventCalendar.vue'
import financialInformation from './financialInformation.vue'
import centralBank from './centralBank.vue'
import ongoing from './ongoing.vue'
import moment from 'moment'

export default {
  components: {
    eventCalendar,
    financialInformation,
    centralBank,
    ongoing
  },
  data() {
    const today = moment().format('YYYYMMDD')
    return {
      eventTab: 'mine',
      officialSrc: `https://rl.fx678.com/date/${ today }.html`
    }
  }
}
</script>
