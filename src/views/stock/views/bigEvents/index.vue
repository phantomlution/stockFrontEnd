<template>
  <div>
    <!--<financial-information />-->
    <el-radio-group v-model="eventTab" style="width: 100%;text-align: center;margin-bottom: 16px">
      <el-radio-button label="mine">我的日历</el-radio-button>
      <el-radio-button label="official">日历</el-radio-button>
      <el-radio-button label="fastNews">7*24</el-radio-button>
      <el-radio-button label="centralBank">央行日程</el-radio-button>
      <el-radio-button label="test">老伙计</el-radio-button>
    </el-radio-group>

    <div>
      <div v-show="eventTab === 'mine'">
        <eventCalendar />
      </div>
      <link-page v-show="eventTab === 'official'" :src="officialSrc"/>
      <link-page v-show="eventTab === 'fastNews'" src="https://kx.fx678.com" />
      <div v-show="eventTab === 'centralBank'">
        <central-bank />
      </div>
      <div v-show="eventTab === 'test'">
        <link-page src="http://www.gov.cn/xinwen/index.htm" />
      </div>
    </div>
  </div>
</template>

<script>
import eventCalendar from './eventCalendar.vue'
import financialInformation from './financialInformation.vue'
import centralBank from './centralBank.vue'
import moment from 'moment'

export default {
  components: {
    eventCalendar,
    financialInformation,
    centralBank
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
