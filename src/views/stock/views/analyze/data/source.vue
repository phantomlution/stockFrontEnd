<template>
  <div>
    <el-form>
      <el-form-item label="重点关注">
        <el-link class="lr-data-source-link" type="danger" href="https://www.fx678.com/" target="_blank">汇通网</el-link>
        <el-link class="lr-data-source-link" type="primary" href="https://www.jin10.com/" target="_blank">金十数据</el-link>
        <el-link class="lr-data-source-link" type="danger" href="http://www.sse.com.cn/" target="_blank">上海证券交易所</el-link>
        <el-link class="lr-data-source-link" type="danger" href="https://rl.fx678.com/" target="_blank">财经大事件日历</el-link>
        <el-link class="lr-data-source-link" type="danger" href="https://cn.investing.com/rates-bonds/usa-government-bonds" target="_blank">美债收益率</el-link>
        <el-link class="lr-data-source-link" type="danger" href="http://biz.finance.sina.com.cn/meeting/showAllMeeting.php" target="_blank">财经会议数据源</el-link>
      </el-form-item>
      <el-form-item label="央行数据">
        <el-link class="lr-data-source-link" type="danger" href="http://www.chinamoney.com.cn/chinese/scggyhywgg/" target="_blank">央行-公开市场操作</el-link>
        <el-link class="lr-data-source-link" type="danger" href="http://www.chinamoney.com.cn/chinese/bkshibor/" target="_blank">Shibor</el-link>
        <el-link class="lr-data-source-link" type="danger" href="http://www.chinamoney.com.cn/chinese/bklpr/" target="_blank">LPR</el-link>
      </el-form-item>
      <el-form-item label="分析报告">
        <el-link class="lr-data-source-link" type="danger" href="http://www.nifd.cn/SeriesReport" target="_blank">国家金融与发展实验室-系列报告</el-link>
      </el-form-item>
      <el-form-item label="新闻数据">
        <el-link class="lr-data-source-link" type="info" href="http://www.xinhuanet.com" target="_blank">新华网</el-link>
        <el-link class="lr-data-source-link" type="info" href="https://www.jiemian.com" target="_blank">界面新闻</el-link>
        <el-link class="lr-data-source-link" type="info" href="http://www.jwview.com/" target="_blank">中新经纬</el-link>
      </el-form-item>
      <el-form-item label="情绪数据">
        <el-link class="lr-data-source-link" type="danger" target="_blank" href="https://money.cnn.com/data/fear-and-greed/">CNN恐慌贪婪指数</el-link>
        <el-link class="lr-data-source-link" type="primary" target="_blank" href="https://quote.fx678.com/symbol/VIXDX">VIX-恐慌指数</el-link>
        <el-link class="lr-data-source-link" type="primary" target="_blank" href="https://quote.fx678.com/symbol/XAU">黄金现货走势</el-link>
      </el-form-item>
      <el-form-item label="股票数据">
        <el-link class="lr-data-source-link" type="danger" target="_blank" href="http://data.eastmoney.com/hsgt/index.html">北向资金</el-link>
      </el-form-item>
      <el-form-item label="其他数据">
        <el-link class="lr-data-source-link" type="primary" target="_blank" href="http://www.stats.gov.cn/">国家统计局</el-link>
        <el-link class="lr-data-source-link" type="primary" target="_blank" href="http://114.115.232.154:8080/" >中国宏观杠杆率数据</el-link>
        <el-link class="lr-data-source-link" type="primary" target="_blank" href="http://data.eastmoney.com/cjsj/hbgyl.html">东方财富-数据中心-经济数据</el-link>
        <el-link class="lr-data-source-link" type="danger" target="_blank" href="http://nc.mofcom.gov.cn/">农产品价格相关-全国农产品商务信息公共服务平台</el-link>
      </el-form-item>
    </el-form>
  </div>
</template>

<style lang="scss">
.lr-data-source-link{
  & + .lr-data-source-link{
    margin-left: 16px;
  }
}
</style>
