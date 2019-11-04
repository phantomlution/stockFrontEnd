document.addEventListener('DOMContentLoaded', function() {
  let host = location.hostname
  let href = location.href
  if (/fx678\.com/.test(host)) {
    let classList = ['fx678']
    Array.prototype.push.apply(classList, document.body.className.split(' '))
    document.body.className = classList.join(' ')
  } else if (/eastmoney\.com/.test(host)) {
    document.body.id = 'eastmoney'
  } else if (/zmz2019\.com/.test(host)) {
    document.body.id = 'zmz'
    document.querySelectorAll("[target='_blank'][rel='nofollow']").forEach(item => {
      item.style.display = 'none'
    })
  } else if (/tianya\.cn/.test(host)) {
    document.body.id = 'tianya'
  } else if (/sina\.com/.test(host)) {
    document.body.id = 'sina'
  } else if (/investing\.com/.test(href)) {
    document.body.id = 'investing'
  }

  window.addEventListener('message', function(event) {
    let eventData = event.data
    if (eventData.event === 'openInNewPage') {
      window.open(window.location.href, '_blank')
    }
  })

})
