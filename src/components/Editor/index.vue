<template>
  <div class="lr-editor lr-editor--background">
    <div :id="editorId"></div>
    <!--<editor :text="text" @edit="processEditOperation" custom-tag="div" :options="options" />-->
  </div>
</template>

<script>
/**
 * simple wrapper for medium-editor
 * Github - http://yabwe.github.io/medium-editor/
 */
import MediumEditor from 'medium-editor'
import 'medium-editor/dist/css/medium-editor.min.css'
import 'medium-editor/dist/css/themes/tim.min.css'
import { idGenerator } from '@/utils'

const props = {
  value: {
    type: String,
    required: true
  },
  placeholder: {
    type: String,
    default: ''
  }
}
export default {
  name: 'LrEditor',
  props,
  data() {
    return {
      editorId: idGenerator.next('editor'),
      editorInstance: null,
      text: this.value
    }
  },
  watch: {
    value(val) {
      if (val !== this.text) {
        this.updateEditorContent(val)
      }
    },
    text(val) {
      this.$emit('input', val)
    },
    focus(val) {
      this.$emit('update:focus', val)
    }
  },
  mounted() {
    this.initEditor()
  },
  beforeDestroy() {
    this.editorInstance.destroy()
  },
  methods: {
    initEditor() {
      const editor = new MediumEditor(`#${ this.editorId }`, {
        targetBlank: true,
        placeholder: {
          text: this.placeholder
        }
      })
      this.editorInstance = editor
      if (this.text) {
        this.updateEditorContent(this.text)
      }
      editor.subscribe('editableInput', (event, element) =>{
        this.text = element.innerHTML
      })
      editor.subscribe('focus', _ => {
        this.$emit('focus')
      })
      editor.subscribe('blur', _ => {
        this.$emit('blur')
      })
    },
    updateEditorContent(val) {
      this.editorInstance.setContent(val, 0)
    }
  }
}
</script>

<style lang="scss">
.lr-editor{
  :focus{
    outline: none;
  }
  padding: 4px 8px;
  &.lr-editor--background{
    background-color: #f5f5f5;
    border-radius: 6px;
  }

  a{
    background-color: transparent;
    color: #FFAA37;
    text-decoration: none;
  }
  ::selection{
    background:rgba(255,170,55,.33);
  }
  h1, h2, h3, p {
    margin-top: 0;
  }
  p{
    line-height: 1.5;
    &:last-child{
      margin-bottom: 0;
    }
  }
}

.medium-editor-toolbar{
  z-index: 999999 !important;
}

.medium-editor-stalker-toolbar{
  display: none !important;
}
</style>
