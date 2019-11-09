<template>
  <div>
    <!--<financial-information />-->
    <el-radio-group v-model="eventTab" style="width: 100%;text-align: center;margin-bottom: 16px">
      <el-radio-button label="mine">我的日历</el-radio-button>
      <el-radio-button label="official">财经事件数据源</el-radio-button>
      <el-radio-button label="fastNews">7*24</el-radio-button>
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
