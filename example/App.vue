<template>
	<div id="app">
		<chacheli-designer-control :layout="layout" :edit-mode="editMode"
			@add="add" @cols="setCols" @rows="setRows" @editMode="editMode = $event" />
		<chacheli-designer v-show="editMode" ref="designer" :layout="layout" :chachelis="chachelis" />
		<chacheli-layout v-show="!editMode" :layout="layout" :chachelis="chachelis" :data="data" :theme="theme" />
	</div>
</template>

<script>
import { ChacheliDesigner, ChacheliLayout } from '../src/lib'
import ChacheliDesignerControl  from './ChacheliDesignerControl.vue'

export default {
	name: 'app',
	components: { ChacheliDesignerControl, ChacheliDesigner, ChacheliLayout },
	data() {
		return {
			idCounter: 10,
			layout: {
				cols: 4,
				rows: 3
			},
      editMode: false,
			chachelis: [
				{
					id: 1,
					x: 0,
					y: 0,
					w: 2,
					h: 2,
					text: 'Hoi',
					available: false,
					comp: 'lr-utility-box',
          meta: {
            title: '123',
            src: 'http://stockpage.10jqka.com.cn/1A0001/',
            width: 589,
            height: 450,
            contentPosition: {
              x: -305,
              y: -375
            }
          }
				},
        {
          id: 2,
          x: 2,
          y: 0,
          w: 2,
          h: 2,
          text: 'hoi',
          available: false,
          comp: 'lr-utility-box',
          meta: {
            title: '123',
            src: 'http://www.ifnews.com/',
            width: 300,
            height: 565,
            proxy: true,
            contentPosition: {
              x: -880,
              y: -125
            }
          }
        },
				{
					id: 3,
					x: 0,
					y: 2,
					w: 1,
					h: 1,
					text: 'Hoi 2',
					available: false,
					comp: 'lr-utility-box',
          meta: {
            title: '123',
            src: 'http://stockpage.10jqka.com.cn/1A0001/',
            width: 589,
            height: 450,
            contentPosition: {
              x: -305,
              y: -375
            }
          }
				},
        {
          id: 4,
          x: 1,
          y: 2,
          w: 1,
          h: 1,
          text: 'Hoi 3',
          available: false,
          comp: 'lr-utility-box',
          meta: {
            title: '123',
            src: 'http://stockpage.10jqka.com.cn/1A0001/',
            width: 589,
            height: 450,
            contentPosition: {
              x: -305,
              y: -375
            }
          }
        },
        {
          id: 5,
          x: 2,
          y: 2,
          w: 1,
          h: 1,
          text: 'Hoi 3',
          available: false,
          comp: 'lr-utility-box',
          meta: {
            title: '123',
            src: 'http://stockpage.10jqka.com.cn/1A0001/',
            width: 589,
            height: 450,
            contentPosition: {
              x: -305,
              y: -375
            }
          }

        },
				{
					id: 6,
					x: 3,
					y: 2,
					w: 1,
					h: 1,
					text: 'Hoi 3',
					available: false,
					comp: 'lr-utility-box',
          meta: {
            title: '123',
            src: 'http://stockpage.10jqka.com.cn/1A0001/',
            width: 589,
            height: 450,
            contentPosition: {
              x: -305,
              y: -375
            }
          }
				},
				{
					id: 7,
					x: 1,
					y: 2,
					w: 1,
					h: 1,
					text: 'Hoi 4',
					available: true,
					comp: 'lr-utility-box',
          meta: {
            title: '123',
            src: 'http://stockpage.10jqka.com.cn/1A0001/',
            width: 589,
            height: 450,
            contentPosition: {
              x: -305,
              y: -375
            }
          }
				}
			],
			data: {
				1: { content: 'some text' },
				2: { content: 'some text 2' },
				3: { content: 'some text 3' },
				4: { content: 'some text 4' }
			}
		}
	},
  computed: {
	  theme() {
	    if (!this.editMode) {
	      return {
	        background: '#eeeeee'
        }
      }
      return null
    }
  },
	methods: {
		add(props, data) {
			let c = Object.assign({
				x: 0,
				y: 0,
				w: 1,
				h: 1,
				text: '',
				available: true
			}, props)

			c.x = parseInt(c.x)
			c.y = parseInt(c.y)
			c.w = parseInt(c.w)
			c.h = parseInt(c.h)

			c.id = this.idCounter++
			this.chachelis.push(c)

			this.data[c.id] = data
		},
		setCols(v) {
			if (v >= this.$refs.designer.minColumns() && v <= 15)
				this.layout.cols = v
		},
		setRows(v) {
		  console.log(this.$refs)
			if (v >= this.$refs.designer.minRows() && v <= 15)
				this.layout.rows = v
		}
	}
}
</script>

<style lang="scss">
html, body, #app {
  height: 100%;
  display: flex;
  flex-direction: column;
}

body {
  margin: 0;
  padding: 0;
}

* {
  box-sizing: border-box;
}

button {
  border: 1px solid #ddd;
  border-radius: 3px;
  background: #fff;
  line-height: 20px;

&:hover {
   background: #f2f2f2;
   border: 1px solid #ccc;
 }
}

.button-group {
button {
  border-radius: 0;

&[disabled] {
   background: #118fe4;
   border-color: #118fe4;
   color: #fff;
 }

&:not(:first-of-type) {
   margin-left: -1px;
 }

&:first-of-type {
   border-top-left-radius: 3px;
   border-bottom-left-radius: 3px;
 }
&:last-of-type {
   border-top-right-radius: 3px;
   border-bottom-right-radius: 3px;
 }
}

}
</style>
