document.addEventListener('DOMContentLoaded', function() {
  let host = location.hostname
  if (/fx678\.com/.test(host)) {
    document.body.id = 'fx678'
  } else if (/eastmoney\.com/.test(host)) {
    document.body.id = 'eastmoney'
  } else if (/zmz2019\.com/.test(host)) {
    document.body.id = 'zmz'
    document.querySelectorAll("[target='_blank'][rel='nofollow']").forEach(item => {
      item.style.display = 'none'
    })
  } else if (/7clang22\.com/.test(host)) {
    document.body.id = 'clang'
  } else if (/taidi\d*.com/.test(host)) {
    document.body.id = 'teddy'
  }
})
