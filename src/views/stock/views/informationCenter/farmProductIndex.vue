<template>
  <lr-box title="市场价格跟踪">
    <el-tabs v-model="goodsId">
      <el-tab-pane :label="item.label" :name="item.goodsId" v-for="(item, itemIndex) of itemList" :key="itemIndex"></el-tab-pane>
    </el-tabs>
    <div>
      <farm-product :goodsId="goodsId" />
    </div>
  </lr-box>
</template>

<script>
import farmProduct from './farmProduct.vue'
export default {
  components: {
    farmProduct,
  },
  data() {
    return {
      goodsId: '',
      itemList: [
        {
          goodsId: '0',
          label: '生鲜指数'
        },
        {
          goodsId: '1',
          label: '蔬菜指数'
        },
        {
          goodsId: '2',
          label: '大白菜指数'
        },
        {
          goodsId: '3',
          label: '马铃薯指数'
        },
        {
          goodsId: '8',
          label: '大蒜指数'
        },
        {
          goodsId: '11',
          label: '生姜指数'
        },
        {
          goodsId: '31',
          label: '红富士指数'
        },

        {
          goodsId: '38',
          label: '鸡蛋指数'
        },
        {
          goodsId: "40",
          label: '白条猪指数'
        }
      ]
    }
  }
}
</script>
