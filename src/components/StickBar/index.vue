<template>
  <div :style="containerStyle">
    <el-popover v-model="containerVisible" placement="left" :width="width" :trigger="trigger" :popper-class="uniqueClass">
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
  },
  keepAlive: { // 是否保持 slot 中组件的状态（例如表格）
    type: Boolean,
    default: false
  },
  visible: {
    type: Boolean,
    default: false
  }
}
export default {
  name: 'LrStickBar',
  props,
  data() {
    return {
      uniqueClass: idGenerator.next('lr-popover-unique'),
      containerVisible: this.visible || false,
      contentVisible: false
    }
  },
  computed: {
    trigger() {
      if (this.keepAlive) {
        return 'manual'
      }
      return 'click'
    },
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
      this.containerVisible = false
    })
  },
  watch: {
    visible(val) {
      this.containerVisible = val
    },
    containerVisible(val) {
      this.$emit('update:visible', val)
      if (val) {
        this.showContent()
      } else {
        this.hideContent()
      }
    },
    contentVisible(val) {
      if (this.keepAlive) {
        this.$nextTick(_ => {
          if (val) {
            document.querySelector(`.${this.uniqueClass}`).style.display = 'block'
          } else {
            document.querySelector(`.${this.uniqueClass}`).style.display = 'none'
          }
        })
      }
    }
  },
  methods: {
    hideContent() {
      if (this.keepAlive) {
        this.containerVisible = true
        this.contentVisible = false
      }
    },
    showContent() {
      if (this.keepAlive) {
        this.containerVisible = true
        this.contentVisible = true
      }
    }
  }
}
</script>

<style lang="scss">
</style>
