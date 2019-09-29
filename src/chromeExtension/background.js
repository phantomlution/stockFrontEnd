chrome.webRequest.onBeforeRequest.addListener(function(details) {
  let url = details.url
  if (/https?:\/\/ad\.wang502\.com/.test(url)) {
    return {
      cancel: true
    }
  }
  console.warn(details)
}, {urls: ["<all_urls>"]}, ["blocking"]);
