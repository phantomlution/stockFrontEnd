<template>
  <div style="display: inline-block">
    <el-link type="primary" @click.stop="showStockDetail">{{ name }}({{ code }})</el-link>

    <el-popover width="320" v-model="visible" v-if="add">
      <p>
        <el-input v-model="desc" placeholder="选择理由" />
      </p>
      <div style="text-align: right; margin: 0">
        <el-button size="mini" type="text" @click="visible = false">取消</el-button>
        <el-button type="primary" size="mini" @click="addToStockPool">确定</el-button>
      </div>
      <el-link size="mini" slot="reference" @click.stop="visible=true">加自选</el-link>
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
      visible: false
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.desc = ''
      }
    }
  },
  methods: {
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
        this.visible = false
      }).catch(_ => {
      })
    }
  }
}
</script>
