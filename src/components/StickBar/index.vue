<template>
  <div :style="containerStyle">
    <el-popover v-model="visible" placement="left" :width="width" trigger="manual" :popper-class="uniqueClass">
      <el-button slot="reference" type="primary" @click.stop="showContent">{{ title }}</el-button>
      <div>
        <slot />
      </div>
    </el-popover>
  </div>
</template>

<script>
/**
 * 缓存 slot 中内容的状态
 */
import { idGenerator } from '@/utils'

const props = {
  title: {
    type: String,
    required: true
  },
  width: {
    type: String,
  },
  top: {
    type: String,
    default: '32px'
  }
}
export default {
  name: 'LrStickBar',
  props,
  data() {
    return {
      uniqueClass: idGenerator.next('lr-popover-unique'),
      visible: false,
      contentVisible: false
    }
  },
  computed: {
    containerStyle() {
      return {
        'position': 'fixed',
        'right': '-2px',
        'top': this.top,
        'z-index': 2000
      }
    }
  },
  beforeDestroy() {
    this.$bus.$off('close_all_stick_bar')
  },
  mounted() {
    this.$bus.$on('close_all_stick_bar', _ => {
      this.contentVisible = false
    })
  },
  watch: {
    contentVisible(val) {
      this.$nextTick(_ => {
        if (val) {
          document.querySelector(`.${this.uniqueClass}`).style.display = 'block'
        } else {
          document.querySelector(`.${this.uniqueClass}`).style.display = 'none'
        }
      })

    }
  },
  methods: {
    showContent() {
      if (!this.visible) {
        this.visible = true
      }
      this.contentVisible = !this.contentVisible
    }
  }
}
</script>

<style lang="scss">
</style>
