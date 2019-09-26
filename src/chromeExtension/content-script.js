console.log('start trial')

document.addEventListener('DOMContentLoaded', function() {
  let host = location.hostname
  if (/fx678\.com/.test(host)) {
    document.body.id = 'fx678'
  } else if (/eastmoney\.com/.test(host)) {
    document.body.id = 'eastmoney'
  }
})
