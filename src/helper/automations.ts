
export function matchAutomations(list, url: string) {
  return list.filter(item => {
    const { pattern } = item
    const regExp = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$")

    return regExp.test(url)
  })
}