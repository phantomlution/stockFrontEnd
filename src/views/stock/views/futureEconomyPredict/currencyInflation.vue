<template>
  <div>
    <div style="margin-bottom: 16px;font-size: 14px;color: rgba(0, 0, 0, 0.65)">
      计算公式：通货膨胀率 = M2 - GDP
    </div>
    <div>
      <el-table :data="itemList" border>
        <el-table-column label="年份" prop="year" />
        <el-table-column label="M2" prop="m2" />
        <el-table-column label="GDP" prop="gdp" />
        <el-table-column label="通胀率" prop="inflation" />
      </el-table>
    </div>
  </div>
</template>

<script>
const rawData = [
  ['2019年第1-3季度', '8.4', '6'],
  ['2019年第1-2季度', '8.5', '6.2'],
  ['2019年第1季度', '8.2', '6.3'],
  ['2018', '8.10', '6.6'],
  ["2017", "8.11", "6.9"],
  ["2016", "11.33", "6.7"],
  ["2015", "13.34", "6.9"],
  ["2014", "11.01", "7.3"],
  ["2013", "13.59", "7.76"],
  ["2012", "14.39", "7.86"],
  ["2011", "17.32", "9.54"],
  ["2010", "18.95", "10.64"],
  ["2009", "28.42", "9.4"],
  ["2008", "17.78", "9.65"],
  ["2007", "16.74", "14.23"],
  ["2006", "22.12", "12.72"],
  ["2005", "16.74", "11.40"],
  ["2004", "14.89", "10.11"],
  ["2003", "19.24", "10.04"],
  ["2002", "13.14", "9.13"],
  ["2001", "15.04", "8.34"],
  ["2000", "12.32", "8.49"],
  ["1999", "14.67", "7.67"],
  ["1998", "14.90", "7.84"],
]

export default {
  data() {
    return {
      itemList: rawData.map(item => {
        return {
          year: item[0],
          m2: `${ item[1] }%`,
          gdp: `${ item[2] }%`,
          inflation: `${(Number(item[1]) - Number(item[2])).toFixed(2) }%`
        }
      })
    }
  }
}
</script>
