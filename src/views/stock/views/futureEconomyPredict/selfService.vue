<template>
  <div v-loading="loading">
    <div style="margin-bottom: 16px">
      <el-cascader v-model="value" :options="itemList" @change="handleChange" style="width: 100%"></el-cascader>
    </div>
    <div>
      <lr-link-page :src="frameSrc" />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      value: [],
      frameSrc: '',
      loading: false,
      itemList: []
    }
  },
  mounted() {
    this.loadIndex()
  },
  methods: {
    updateFrame() {
      this.frameSrc = `https://rl.fx678.com/id/${ this.value[1] }.html`
    },
    handleChange() {
      this.$nextTick(_ => {
        this.updateFrame()
      })
    },
    loadIndex() {
      this.itemList = []
      this.$http.get(`/api/data/huitong/index`).then(indexList => {
        const map = {}
        indexList.forEach(item => {
          if (!map[item.country]) {
            map[item.country] = []
          }
          map[item.country].push(item)
        })

        const keyList = Object.keys(map)
        const cascaderItemList = []
        keyList.forEach(_key => {
          cascaderItemList.push({
            label: _key,
            value: _key,
            children: map[_key].map(item => {
              return {
                label: item['IDX_DESC_CN'],
                value: item['IDX_ID']
              }
            })
          })
        })
        this.itemList = cascaderItemList
      }).catch(_ => {
        console.error(_)
      })
    }
  }
}
</script>
