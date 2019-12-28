const local_host_url = 'http://localhost:8080'

chrome.webRequest.onBeforeRequest.addListener(function(details) {
  let url = details.url

  if (/https?:\/\/ad\.wang502\.com/.test(url)) {
    return {
      cancel: true
    }
  }

}, {urls: ["<all_urls>"]}, ["blocking"]);

chrome.webRequest.onHeadersReceived.addListener(function(details) {
  let url = details.url

  if (details.initiator === local_host_url && /js\.fx678img\.com/.test(url)) {
    const responseHeaders = []
    for (var i = 0; i < details.responseHeaders.length; ++i) {
      let headerItem = details.responseHeaders[i]
      let headerItemName = headerItem.name
      if (['Access-Control-Allow-Origin', 'Access-Control-Allow-Credentials'].indexOf(headerItemName) === -1 ) {
        responseHeaders.push(details.responseHeaders[i])
      }
    }

    responseHeaders.push({name: 'Access-Control-Allow-Credentials', value: 'true'})
    responseHeaders.push({name: "Access-Control-Allow-Origin", value: local_host_url })
    return {
      responseHeaders: responseHeaders
    }
  }

  return { responseHeaders: details.responseHeaders };


}, {urls: ["<all_urls>"]}, [ 'blocking', 'responseHeaders', 'extraHeaders']);

function replaceHeader(headers, name, value) {
  for (var i = 0; i < headers.length; ++i) {
    if (headers[i].name === name) {
      headers[i].value = value
      return
    }
  }
  // 未找到
  headers.push({
    name: name,
    value: value
  })
}

chrome.webRequest.onBeforeSendHeaders.addListener(function(details) {
  let url = details.url
  if (details.initiator === local_host_url) {
    if (/js\.fx678img\.com/.test(url)){
      replaceHeader(details.requestHeaders, 'Origin', 'https://kx.fx678.com')
      replaceHeader(details.requestHeaders, 'Host', 'js.fx678img.com:8800')
    }
  }


  if (url.indexOf('.jpg') !== -1 || url.indexOf('.png') !== -1) {
    for (var i = 0; i < details.requestHeaders.length; ++i) {
      let headerItem = details.requestHeaders[i]
      let headerItemName = headerItem.name
      if (headerItemName === 'Referer') {
        details.requestHeaders.splice(i, 1)
      }
    }
  }

  return { requestHeaders: details.requestHeaders };
}, {urls: ["<all_urls>"]}, [ 'blocking', 'requestHeaders', 'extraHeaders']);
