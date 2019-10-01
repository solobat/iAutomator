import browser from 'webextension-polyfill'

export function getAll(params = {}) {
  return browser.cookies.getAll(params)
}

export default function hanlder(req) {
  const { data, action } = req

  if (action === 'cookies.getAll') {
    return getAll(data)
  } else {
    return Promise.resolve({})
  }
}