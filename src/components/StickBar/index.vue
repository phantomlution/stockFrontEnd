<template>
  <div :style="containerStyle">
    <el-popover v-model="containerVisible" :placement="placement" :width="width" :trigger="trigger" :popper-class="customClass">
      <el-button slot="reference" type="primary" @click="toggleContent">{{ title }}</el-button>
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
  clearPadding: {
    type: Boolean,
    default: false
  },
  visible: {
    type: Boolean
  },
  placement: {
    type: String,
    default: 'left'
  }
}
export default {
  name: 'LrStickBar',
  props,
  data() {
    return {
      uniqueClass: idGenerator.next('lr-popover-unique'), // 用于外部获取当前DOM
      containerVisible: false, // 容器是否可见
      contentVisible: false // 内容是否课件
    }
  },
  computed: {
    customClass() {
      const classList = [this.uniqueClass]
      if (this.clearPadding) {
        classList.push('lr-clear')
      }
      return classList.join(' ')
    },
    manual() {
      return this.keepAlive
    },
    trigger() {
      if (this.manual) {
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
    },
    isShow() {
      if (this.manual) {
        return this.contentVisible
      }
      return this.containerVisible
    }
  },
  watch: {
    isShow(val) {
      this.$emit('update:visible', val)
    },
    contentVisible(val) {
      if (this.manual) {
        this.$nextTick(_ => {
          if (val) {
            document.querySelector(`.${this.uniqueClass}`).style.display = 'block'
          } else {
            document.querySelector(`.${this.uniqueClass}`).style.display = 'none'
          }
        })
      }
    },
  },
  beforeDestroy() {
    this.$bus.$off('close_all_stick_bar')
  },
  mounted() {
    this.$bus.$on('close_all_stick_bar', _ => {
      this.hide()
    })
  },
  methods: {
    toggleContent() {
      if (!this.manual) {
        return
      }
      if (this.isShow) {
        this.hide()
      } else {
        this.show()
      }
    },
    hide() {
      if (this.manual) {
        this.containerVisible = true
        this.contentVisible = false
      } else {
        this.containerVisible = false
      }
    },
    show() {
      this.containerVisible = true
      if (this.manual) {
        this.contentVisible = true
      }
    }
  }
}
</script>

<style lang="scss">
</style>
