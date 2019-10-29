<template>
  <div style="display: inline-block">
    <el-link type="primary" @click.stop="showStockDetail">{{ name }}({{ code }})</el-link>
    <el-popover width="320" trigger="manual" v-model="dialogVisible" v-if="add">
      <div>
        <p>
          <el-input v-model="desc" placeholder="选择理由" />
        </p>
        <div style="text-align: right; margin: 0">
          <el-button size="mini" type="text" @click.stop="dialogVisible = false">取消</el-button>
          <el-button type="primary" size="mini" @click.stop="addToStockPool">确定</el-button>
        </div>
      </div>
      <el-link slot="reference" @click.stop="showAddDialog">加自选</el-link>
    </el-popover>
  </div>
</template>

<script>
const props = {
  code: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  add: { // 所以的添加功能
    type: Boolean,
    default: false
  }
}
export default {
  name: 'LrStockDetailLink',
  props,
  data() {
    return {
      desc: '',
      dialogVisible: false
    }
  },
  watch: {
    dialogVisible(val) {
      console.log(val)
      if (val) {
        this.desc = ''
      }
    }
  },
  methods: {
    showAddDialog() {
      this.dialogVisible = true
    },
    showStockDetail() {
      const code = this.code
      this.$bus.$emit('showStockDetail', code)
    },
    addToStockPool() {
      this.$store.dispatch('addToStockPool', {
        code: this.code,
        name: this.name,
        temp: true,
        desc: this.desc
      }).then(_ => {
        this.dialogVisible = false
      }).catch(_ => {
      })
    }
  }
}
</script>
