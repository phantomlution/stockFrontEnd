<template>
  <el-popover width="320" trigger="manual" v-model="dialogVisible">
    <div v-loading="loading">
      <p>
        <el-input v-model="desc" placeholder="选择理由" />
      </p>
      <div style="text-align: right; margin: 0">
        <el-button size="mini" type="text" @click.stop="dialogVisible=false">取消</el-button>
        <el-button type="primary" size="mini" @click.stop="addToStockPool">确定</el-button>
      </div>
    </div>
    <el-link slot="reference" @click.stop="dialogVisible=true">加自选</el-link>
  </el-popover>
</template>

<script>
// 加入自选池

const props = {
  code: {
    type: String,
    required: true
  },
  temp: {
    type: Boolean,
    default: true
  }
}
export default {
  name: 'LrShoppingCart',
  props,
  data() {
    return {
      oldModel: null,
      desc: '',
      dialogVisible: false,
      loading: true
    }
  },
  watch: {
    code() {
      this.dialogVisible = false
    },
    dialogVisible(val) {
      if (val) {
        this.loadHistoryData()
      }
    }
  },
  methods: {
    loadHistoryData() {
      this.desc = ''
      this.oldModel = null
      this.loading = true
      const code = this.code
      this.$http.get(`/api/stock/pool/item`, { code }).then(_ => {
        if (_) {
          this.oldModel = _
          this.desc = _.desc || ''
        }

        this.loading = false
      }).catch(_ => {
        this.dialogVisible = false
        console.error(_)
      })
    },
    addToStockPool() {
      let model = this.oldModel
      if (!this.model) {
        model = {
          code: this.code,
          temp: this.temp
        }
      }

      model['desc'] = this.desc
      this.$store.dispatch('addToStockPool', model).then(_ => {
        this.dialogVisible = false
      }).catch(_ => {
      })
    }
  }
}
</script>
