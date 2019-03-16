import XLSX from 'xlsx'

const excelUtils = {
  export({ data, name = 'default' }) {
    const ws = XLSX.utils.aoa_to_sheet(data)
    var wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, `${ name }.xlsx`);
  }
}

export default {
  install(Vue) {
    Vue.prototype.$excel = excelUtils
  }
}
