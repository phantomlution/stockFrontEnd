<template>
  <div>
    <div style="margin-bottom: 16px">
      <el-select v-model="date" @change="loadData">
        <el-option :label="item" :value="item" :key="item" v-for="item in dateList"></el-option>
      </el-select>
    </div>

    <div>
      <lr-box :title="city.label + ' 不满二年率（包括大量无产权数据样本造成误差）'" v-for="(city, $index) of chartList" :key="$index">
        <lr-chart :ref="'chart' + $index"></lr-chart>
      </lr-box>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      date: '',
      dateList: [],
      estateData: null,
      cityList: [
        {
          label: '一线城市',
          value: ['北京', '上海', '广州', '深圳']
        },
        {
          label: '新一线',
          value: ["成都", "杭州", "重庆", "武汉", "西安", "苏州", "天津", "南京", "长沙", "郑州", "东莞", "青岛", "沈阳", "宁波", "昆明"]
        },
        {
          label: '二线',
          value: ['大连', '济南', '合肥', '佛山', '温州']
        },
        {
          label: '三线',
          value: ['珠海', '镇江', '海口', '咸阳']
        }
      ],
      chartList: []
    }
  },
  mounted() {
    this.loadDateList()
  },
  methods: {
    loadDateList() {
      this.dateList = []
      this.$http.get(`/api/data/estate/date/list`).then(_ => {
        this.dateList = _
      }).catch(_ => {
        console.error(_)
      })
    },
    loadData(date) {
      return this.$http.get('/api/data/estate', { date }).then(response => {
        this.estateData = response

        this.analyze()
      }).catch(_ => {
        console.error(_)
      })
    },
    analyze() {
      this.chartList = []
      const result = []

      // 计算数据
      this.cityList.forEach(item => {
        result.push({
          label: item.label,
          value: item.value.map(city => this.getCityData(city))
        })
      })

      this.chartList = result
      // 渲染图表
      this.renderChart()
    },
    getCityData(cityName) {
      for (let i=0; i<this.estateData.length; i++) {
        let province = this.estateData[i]
        for (let j=0; j<province.data.length; j++) {
          let city = province.data[j]
          if (city.name === cityName) {
            let cityData = city.estate
            cityData['name'] = cityName
            cityData['less_than_two_year_rate'] = parseInt(cityData['less_than_two_year'] * 100 / cityData['total'])
            return cityData
          }
        }
      }
      return null
    },
    renderChart() {
      this.$nextTick(_ => {
        this.chartList.forEach((chartItem, chartIndex) => {
          const chartReference = `chart${ chartIndex }`
          const chart = this.$refs[chartReference][0].getChart()

          chart.source(chartItem.value)
          chart.interval().position('name*less_than_two_year_rate').tooltip('less_than_two_year_rate*total*less_than_two_year*two_year*five_year').opacity(1).label('less_than_two_year_rate', {
            useHtml: true,
            htmlTemplate: function htmlTemplate(text, item) {
              let dataPoint = item.point
              let percent = `${ dataPoint.less_than_two_year_rate }%`
              return '<span class="g2-label-item"><p class="g2-label-item-percent">' + percent + '</p></div>';
            }
          })
          chart.render()
        })
      })
    }
  }
}
</script>
