<template>
  <div class="lr-frame-container" v-loading="loading">
    <div v-if="title" style="text-align: center">
      <el-tag size="large">{{ title }}</el-tag>
    </div>
    <div class="lr-frame-action">
      <el-button circle type="primary" @click.stop="reload" icon="el-icon-refresh"></el-button>
    </div>
    <iframe :id="frameId" :src="localSrc" style="width: 100%;height: 100%;border: none" />
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
  }
}

export default {
  props,
  data() {
    return {
      loading: false,
      localSrc: '',
      frameId: idGenerator.next()
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
    getFrame() {
      return document.getElementById(this.frameId)
    },
    reload() {
      if (!this.src) {
        return
      }
      this.loading = true
      this.localSrc = ''
      this.$nextTick(_ => {
        this.localSrc = this.src
      })

    },
    loaded() {
      this.loading = false
    }
  }
}
</script>

<style>
.lr-frame-container{
  width: 100vw;
  height: 100vh;
  position: relative;
}

.lr-frame-action{
  position: absolute;
  right: 8px;
  top: 8px;
}

</style>
