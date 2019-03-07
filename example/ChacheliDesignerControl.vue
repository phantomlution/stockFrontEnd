<template>
	<div class="chacheli-designer-control">
    <el-radio-group v-model="currentViewMode">
      <el-radio-button :label="item.value" :key="item.value" v-for="item of viewMode">{{ item.label }}</el-radio-button>
    </el-radio-group>

    <span v-show="editMode">
      <b>Cols</b>: <el-input-number :value="layout.cols" @input="setCols" controls-position="right" style="width: 80px" />
      <b>Rows</b>: <el-input-number :value="layout.rows" @input="setRows" controls-position="right" style="width: 80px" />
    </span>

    <LrButtonForm />

    <el-popover v-model="addDialogVisible">
      <div>
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
        <div style="text-align: right">
          <el-button @click.stop="cancelAdd">取消</el-button>
          <el-button type="primary" @click.stop="confirmAdd">确定</el-button>
        </div>
      </div>
      <el-button slot="reference" type="primary">添加</el-button>
    </el-popover>
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
		  currentViewMode: viewMode[0].value,
      availableComponentList,
      formModel: {
		    text: '',
        comp: ''
      },
      addDialogVisible: false,
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
			this.$emit('cols', v)
		},
		setRows(v) {
			this.$emit('rows', v)
		},
    clearDialog() {
		  this.$refs.form && this.$refs.form.resetFields()
      this.addDialogVisible = false
    },
    cancelAdd() {
		  this.clearDialog()
    },
    confirmAdd() {
		  this.$refs.form.validate(valid => {
		    if (valid) {
		      this.add()
          this.clearDialog()
        }
      })
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
