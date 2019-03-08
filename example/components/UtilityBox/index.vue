<template>
  <div class="lr-utility">
    <div class="lr-utility__header">
      <div style="flex: 1">
        {{ containerMeta.title }}
      </div>
      <div>
        <div style="text-align: right">
          <el-button type="text" @click="reload">刷新</el-button>
          <el-button type="text" @click="handleMask">
            <template v-if="showMask">关闭遮罩</template>
            <template v-else>打开遮罩</template>
          </el-button>
          <el-button type="text" @click="handleFullScreen">
            <template v-if="isFullScreen">退出全凭</template>全屏
          </el-button>
        </div>
      </div>
    </div>
    <div class="lr-utility__content" :id="contentElementId">
      ﻿<lr-view-box ref="viewBox" :src="containerMeta.src" :scale="scale" :showMask="showMask" :contentPosition="containerMeta.contentPosition" :proxy="containerMeta.proxy" :container-width="containerMeta.width" :container-height="containerMeta.height" />
    </div>
  </div>
</template>

<script>
import { getElementSize, getZoomOutRatio } from '../../utils'

const props = {
  meta: {
    type: Object,
    required: true
  }
}

export default {
  name: 'LrUtilityBox',
  props,
  data() {
    return {
      isFullScreen: false,
      scale: 1,
      showMask: true,
      lastElementSize: null,
      resizeInterval: null,
      contentElementId: `random_${ new Date().getTime() }`,
      contentElement: null
    }
  },
  computed: {
    containerMeta() {
      console.log(this.meta)
      return this.meta
    }
  },
  mounted() {
    this.contentElement = document.getElementById(this.contentElementId)
    this.startResizeInterval()
  },
  destroyed() {
    this.clearResizeInterval()
  },
  methods: {
    handleFullScreen() {
      if (!this.isFullScreen) {
        this.doFullScreen()
      } else {
        this.doExitFullScreen()
      }
    },
    doExitFullScreen() {
      this.isFullScreen = false
      document.exitFullscreen()
    },
    doFullScreen() {
      this.$el.requestFullscreen().then(_ => {
        this.isFullScreen = true
      }).catch(_ => {
        this.$message.error('浏览器不支持全屏')
      })
    },
    startResizeInterval() {
      this.clearResizeInterval()
      this.updateSizeInfo()
      this.resizeInterval = setInterval(_ => {
        const elementSize = getElementSize(this.contentElement)
        if (this.hasSizeChanged()) {
          const zoomOutRatio = getZoomOutRatio(this.containerMeta, elementSize)
          this.updateSizeInfo()
          this.scale = Number(zoomOutRatio.toFixed(2))
        }

      }, 1000)
    },
    clearResizeInterval() {
      this.resizeInterval && clearInterval(this.resizeInterval)
    },
    handleMask() {
      this.showMask = !this.showMask
    },
    getSize() {
      return getElementSize(this.contentElement)
    },
    updateSizeInfo() {
      this.lastElementSize = this.getSize()
    },
    hasSizeChanged() {
      const currentElementSize = this.getSize()
      const isEqual = currentElementSize.width === this.lastElementSize.width && currentElementSize.height && this.lastElementSize.height
      return !isEqual
    },
    reload() {
      this.$refs.viewBox.reload()
    }
  }
}
</script>

<style lang="scss">
$padding: 8;

.lr-utility{
  background: #ffffff;
  box-shadow: 0 4px 70px -18px #707070;
  padding: #{$padding}px;
  border-radius: 4px;
  width: 100%;
}

.lr-utility__header{
  display: flex;
}

.lr-utility__content{
  height: calc(100% - #{ $padding + 16 }px);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
