
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