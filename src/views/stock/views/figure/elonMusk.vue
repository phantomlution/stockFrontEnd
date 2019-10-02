<template>
  <div>
    <div>
      <el-tag :key="$index" size="large" v-for="(item, $index) of companyList">{{ item.name }}</el-tag>
    </div>
    <lr-link-page :skipLoading="true" src="https://www.cnbc.com/elon-musk/" />
  </div>
</template>

<script>
export default {
  data() {
    return {
      companyList: [
        {
          name: 'SpaceX'
        },
        {
          name: 'Tesla'
        },
        {
          name: 'The Boring Company'
        },
        {
          name: 'OpenAI'
        },
        {
          name: 'Neuralink'
        },
        {
          name: 'Hyperloop'
        }
      ]
    }
  }
}
</script>
