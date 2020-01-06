<template>
  <div>
    <lr-list :data="list">
      <template slot="table">
        <el-table-column prop="name" label="name"></el-table-column>
        <el-table-column prop="name" label="name"></el-table-column>
      </template>
      <template slot="card" slot-scope="scope">
        {{ scope.item }}
      </template>
    </lr-list>
  </div>
</template>

<script>
export default {
  data() {
    return {
      list: [
        {
          name: '1',
        },
        {
          name: '2'
        }
      ]
    }
  },
  methods: {
    test() {
      console.log('test')
    }
  }
}
</script>
