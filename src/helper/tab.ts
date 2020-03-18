
// https://developer.chrome.com/extensions/activeTab
export function getTabMeta(tab: chrome.tabs.Tab) {
  if (tab) {
    const { url } = tab

    if (url.startsWith('http')) {
      const { host, hostname, pathname, hash, search } = new URL(url)

      return {
        ...tab,
        host, hostname, pathname, hash, search
      }
    } else {
      return null
    }
  } else {
    return null
  }
}

export function getTabs(fn) {
  chrome.tabs.query({ currentWindow: true, active: true }, (results) => {
    if (results && results.length) {
      const info = getTabMeta(results[0])

      if (info) {
        fn(info)
      }
    }
  })
}