<!-- 电影中发现的策略 -->
<template>
  <div>
    <el-form :model="formModel" label-width="64px" ref="form">
      <el-form-item label="剧集" prop="movie" :rules="[ { required: true } ]">
        <el-cascader :options="optionList" v-model="formModel.movie" style="width: 300px"></el-cascader>
      </el-form-item>
      <el-form-item label="时间" prop="time" :rules="[ { required: true }]">
        <el-time-picker v-model="formModel.time" format="HH:mm:ss"></el-time-picker>
      </el-form-item>
      <el-form-item label="内容" prop="content">
        <lr-editor v-model="formModel.content" style="height: 55vh"></lr-editor>
      </el-form-item>
    </el-form>
    <div style="text-align: right">
      <el-button type="primary" @click.stop="saveItem">保存</el-button>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      formModel: {
        time: '',
        movie: null,
        content: ''
      },
      optionList: []
    }
  },
  mounted() {
    this.loadMovieList()
  },
  methods: {
    saveItem() {
      const form = this.$refs.form
      form.validate(valid => {
        if (valid) {
          const movie = this.formModel.movie
          const model = {
            movieId: movie[0],
            season: movie[1],
            episode: movie[2],
            time: this.$moment(this.formModel.time).format('HH:mm:ss'),
            content: this.formModel.content
          }
          this.$http.post(`/api/movie/comment`, model).then(_ => {
            this.$message.success('保存成功')
            form.resetFields()
          }).catch(_ => {
            console.error(_)
          })

          console.log(model)
        }
      })
    },
    loadMovieList() {
      this.$http.get('/api/movie/').then(movieList => {
        this.optionList = movieList.map(movie => {
          return {
            label: movie.name,
            value: movie._id,
            children: movie.series.map(series => {
              return {
                label: `第${ series.season }季`,
                value: series.season,
                children: series.episode.map(episode => {
                  return {
                    label: `第${ episode }集`,
                    value: episode
                  }
                })
              }
            })
          }
        })
      }).catch(_ => {
        console.error(_)
      })
    }
  }
}
</script>
