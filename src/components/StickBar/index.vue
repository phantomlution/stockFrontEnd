<template>
  <div :style="containerStyle">
    <el-popover v-model="containerVisible" placement="left" :width="width" :trigger="trigger" :popper-class="uniqueClass">
      <el-button slot="reference" type="primary" @click.stop="toggleContent">{{ title }}</el-button>
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
  }
}
export default {
  name: 'LrStickBar',
  props,
  data() {
    return {
      uniqueClass: idGenerator.next('lr-popover-unique'),
      containerVisible: false, // 容器是否可见
      contentVisible: false // 内容是否课件
    }
  },
  computed: {
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
    }
  },
  watch: {
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
      this.containerVisible = false
    })
  },
  methods: {
    toggleContent() {
      if (this.manual) {
        this.containerVisible = true
        this.contentVisible = !this.contentVisible
      }
    },
    show() {
      if (this.manual) {
        this.contentVisible = true
      }
      this.containerVisible = true
    }
  }
}
</script>

<style lang="scss">
</style>
