<template>
  <div>
    <span class="el-timeline-item__timestamp lr-chess-manual--week">{{ item.date | week }}</span>
    <el-row>
      <el-col :span="10">
        <lr-editor v-model="item.predict" placeholder="今天还没有预测分析哦" :style="editorStyle" @focus="focus('predict')" @blur="blur('predict')"/>
        <div class="lr-chess-manual--button">
          <el-button type="primary" v-if="predict.focused" @click.stop="updateValue('predict')">保存</el-button>
        </div>
      </el-col>
      <el-col :span="4">
        <el-row style="padding: 0 16px;margin-top: 56px">
          <el-col :span="11">
            <span style="color: #e6a23c;font-size: 12px">预测</span>
          </el-col>
          <el-col :span="2" style="text-align: center">
            <el-divider direction="vertical"></el-divider>
          </el-col>
          <el-col :span="11" style="text-align: right">
            <span style="color: #e6a23c;font-size: 12px">复盘</span>
          </el-col>
        </el-row>
      </el-col>
      <el-col :span="10">
        <lr-editor v-model="item.replay" placeholder="今天还没有复盘哦" :style="editorStyle" @focus="focus('replay')" @blur="blur('replay')"/>
        <div class="lr-chess-manual--button" >
          <el-button type="primary" v-if="replay.focused" @click.stop="updateValue('replay')">保存</el-button>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { deepClone } from '@/utils'

const props = {
  item: {
    type: Object,
    required: true
  }
}

export default {
  props,
  data() {
    return {
      predict: {
        focused: false,
        oldValue: ''
      },
      replay: {
        focused: false,
        oldValue: ''
      }
    }
  },
  computed: {
    editorStyle() {
      return {
        'height': '120px',
        'overflow': 'auto',
      }
    }
  },
  methods: {
    focus(field) {
      if (!this[field].focused) {
        this[field].focused = true
        this[field].oldValue = deepClone(this.item[field])
      }
    },
    blur(field) {
      if (this.item[field] === this[field].oldValue) {
        this.reset(field)
      }
    },
    reset(field) {
      this[field].focused = false
      this[field].oldValue = ''
    },
    updateValue(field) { // 更新内容
      this.$http.put(`/api/chess/`, {
        date: this.item.date,
        field,
        content: this.item[field]
      }).then(_ => {
        this.$message.success('更新成功')
        this.reset(field)
      }).catch(_ => {
        console.error(_)
      })
    }
  }
}
</script>

<style lang="scss">
.lr-chess-manual--button{
  text-align: right;
  margin-top: 8px;
  height: 28px;
}
.lr-chess-manual--week{
  position: absolute;
  left: -42px !important;
  top: 32px !important;
}
</style>
