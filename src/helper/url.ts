
export function getPath(url) {
  const u = new URL(url)

  return u.pathname
}

export function getHost(url) {
  const u = new URL(url)

  return u.host
}