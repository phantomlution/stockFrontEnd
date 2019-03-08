<template>
  <div :style="scaleStyle">
    <div class="view-container" :style="containerStyle">
      <div v-show="showMask" class="view-box-mask" @mousedown="mousedown" @mousemove="mousemove" @mouseup="mouseup"></div>
      <div :id="contentId" class="view-box" :style="contentStyle">
        <iframe type="text/html" :src="proxySrc" :width="width" :height="height" ref="frame"/>
      </div>
    </div>
  </div>
</template>

<script>
const props = {
  src: {
    type: String,
    required: true
  },
  containerWidth: {
    type: Number,
    default: 500
  },
  containerHeight: {
    type: Number,
    default: 500
  },
  width: {
    type: Number,
    default: 1200
  },
  height: {
    type: Number,
    default: 2000
  },
  scale: {
    type: Number,
    default: 1
  },
  showMask: {
    type: Boolean,
    default: true
  },
  contentPosition: {
    type: Object,
    required: true
  },
  proxy: {
    type: Boolean,
    default: false
  }
}

export default {
  name: 'LrViewBox',
  props,
  data() {
    return {
      currentSrc: this.src,
      contentId: `random_${ new Date().getTime().toString()}`,
      content: null,
      canDrag: false,
      startPosition: null,
      lastPosition: null
    }
  },
  computed: {
    scaleStyle() {
      return {
        transform: `scale(${ this.scale })`
      }
    },
    containerStyle() {
      return {
        width: `${ this.containerWidth }px`,
        height: `${ this.containerHeight }px`
      }
    },
    contentStyle() {
      return {
        left: `${ this.contentPosition.x }px`,
        top: `${ this.contentPosition.y }px`
      }
    },
    proxySrc() { // 绕过验证
      if (this.currentSrc && this.proxy) {
        return `http://localhost:5000/redirect?url=${ this.currentSrc }`
      }
      return this.currentSrc
    }
  },
  watch: {
    src(val) {
      this.currentSrc = val
    }
  },
  destroy() {
    if (this.content) {
      this.content = null
    }
  },
  methods: {
    mousedown(event) {
      this.startPosition = this.getEventPosition(event);
      this.lastPosition = Object.assign({}, this.contentPosition)
      this.canDrag = true;
    },
    mousemove(event) {
      if (!this.canDrag) return;
      const endPosition = this.getEventPosition(event);
      this.contentPosition.x = this.lastPosition.x + endPosition.x - this.startPosition.x;
      this.contentPosition.y = this.lastPosition.y + endPosition.y - this.startPosition.y;
    },
    mouseup(event) {
      this.canDrag = false;
      console.log('current position')
      console.log(this.contentPosition)
      this.lastPosition = null;
      this.startPosition = null;
    },
    getEventPosition(event) {
      return {
        x: event.x,
        y: event.y
      }
    },
    getContent() {
      if (!this.content) {
        this.content = document.querySelector(this.contentId)
      }
      return this.content
    },
    reload() {
      const oldSrc = this.currentSrc
      this.currentSrc = ''
      this.$nextTick(_ => {
        console.log('chaged')
        this.currentSrc = oldSrc
      })
    }
  }
}
</script>

<style lang="scss">
.view-container{
  position: relative;
  overflow: hidden;
}
.view-box{
  position: absolute;
  overflow: hidden;
  z-index: 10;
}
.view-box-mask{
  position: absolute;
  left: 0;
  top: 0;
  width: inherit;
  height: inherit;
  background: rgba(0, 0, 0, 0.9);
  z-index: 100;
}
</style>
