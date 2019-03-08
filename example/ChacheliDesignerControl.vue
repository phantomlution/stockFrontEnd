<template>
	<div class="chacheli-designer-control">
    <el-radio-group v-model="currentViewMode">
      <el-radio-button :label="item.value" :key="item.value" v-for="item of viewMode">{{ item.label }}</el-radio-button>
    </el-radio-group>

    <LrButtonForm v-show="editMode" :showFooter="false" buttonName="基础配置">
      <el-form label-width="40px">
        <el-form-item label="行数">
          <el-input-number :value="layout.rows" @input="setRows" style="width: 120px" />
        </el-form-item>
        <el-form-item label="列数">
          <el-input-number :value="layout.cols" @input="setCols" style="width: 120px" />
        </el-form-item>
      </el-form>
    </LrButtonForm>

    <LrButtonForm v-show="editMode" buttonName="添加栏目" :visible.sync="boxVisible" @confirm="confirm">
      <el-form :model="formModel" ref="form" label-width="80px">
        <el-form-item label="标题" prop="text" :rules="[ { required: true } ]">
          <el-input v-model.trim="formModel.text" />
        </el-form-item>
        <el-form-item label="组件" prop="comp" :rules="[ { required: true } ]">
          <el-select v-model="formModel.comp" >
            <el-option v-for="item of availableComponentList" :label="item.label" :value="item.value" :key="item.value"/>
          </el-select>
        </el-form-item>
      </el-form>
    </LrButtonForm>
	</div>
</template>

<script>

const props = [ 'layout', 'data', 'editMode' ]
const viewMode = [
  { label: 'Edit', value: 'Edit' },
  { label: 'Show', value: 'Show' }
]

const availableComponentList = [
  { label: 'Red', value: 'dummy-red' },
  { label: 'Green', value: 'dummy-green' },
  { label: 'Blue', value: 'dummy-blue' }
]

export default {
	name: 'chacheli-designer-control',
	props,
	data() {
		return {
		  viewMode,
		  currentViewMode: viewMode[1].value,
      availableComponentList,
      formModel: {
		    text: '',
        comp: ''
      },
      boxVisible: false,
			localData: {
				content: ''
			}
		}
	},
  watch: {
    currentViewMode(val) {
      this.$emit('editMode', val === viewMode[0].value)
    }
  },
	methods: {
		add() {
		  this.$emit('add', this.formModel)
		},
		setCols(v) {
		  if (v === this.layout.cols) return
			this.$emit('cols', v)
		},
		setRows(v) {
		  if (v === this.layout.rows) return
			this.$emit('rows', v)
		},
    confirm() {
      this.boxVisible = false
    }
	}
}
</script>


<style lang="scss">
  .chacheli-designer-control {
    padding: 10px;
    border-bottom: 1px solid #ddd;

  button + button {
    margin-left: -1px;
  }

  span.form {
    padding-left: 20px;
  }
  }
</style>
