
export function getPath(url) {
  const u = new URL(url)

  return u.pathname
}