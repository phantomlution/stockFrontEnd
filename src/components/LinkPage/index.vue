<template>
  <div class="lr-frame-container" :id="containerId" :style="style" v-loading="loading">
    <div v-if="title" style="text-align: center">
      <el-tag size="large">{{ title }}</el-tag>
    </div>
    <div class="lr-frame-action">
      <el-button circle type="primary" @click.stop="reload" icon="el-icon-refresh"></el-button>
      <el-button circle type="primary" @click.stop="openInWindow" icon="el-icon-document-add"></el-button>
    </div>
    <iframe :id="frameId" :src="localSrc" style="width: 100%;height: inherit;border: none" />
  </div>
</template>

<script>
import { idGenerator } from '@/utils'

const props = {
  title: {
    type: String,
    default: ''
  },
  src: {
    type: String,
    required: true
  },
  skipLoading: {
    type: Boolean,
    default: false
  },
  redirect: {
    type: Boolean,
    default: false
  }
}

export default {
  name: 'LrLinkPage',
  props,
  data() {
    const frameId = idGenerator.next()
    return {
      loading: false,
      localSrc: '',
      frameId,
      containerId: `container_${ frameId }`,
      style: null
    }
  },
  watch: {
    src() {
      this.reload()
    }
  },
  mounted() {
    const frame = this.getFrame()
    frame.onload = _ => {
      this.loaded()
    }
    this.reload()

  },
  methods: {
    openInWindow() {
      // 必须先安装项目下的 chrome Extension
      const frameLocation = this.getFrame()
      frameLocation.contentWindow.postMessage({
        event: 'openInNewPage'
      }, '*')
    },
    getFrame() {
      return document.getElementById(this.frameId)
    },
    reload() {
      if (!this.src) {
        return
      }
      if (!this.skipLoading) {
        this.loading = true
      }

      this.$nextTick(_ => {
        this.localSrc = ''
        setTimeout(_ => {
          this.localSrc = `${ this.redirect ? '/api/redirect?url=' : '' }${ this.src }`
          console.warn(this.localSrc)
        }, 100)
      })

    },
    loaded() {
      console.log('loaded')
      this.loading = false
      this.calculateStyle()
    },
    calculateStyle() {
      const container = document.getElementById(this.containerId)
      const offsetHeight = container.offsetTop
      this.style = {
        height: `calc(100vh - ${ offsetHeight }px)`
      }
    }
  }
}
</script>

<style lang="scss">
.lr-frame-container{
  max-width: 100%;
  width: 100vw;
  height: 100vh;
  position: relative;
}

.lr-frame-action{
  position: absolute;
  right: 8px;
  top: 32px;
  transform: rotate(90deg);
  .el-button{
    transform: rotate(-90deg);
  }
}

</style>
