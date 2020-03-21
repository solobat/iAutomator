import { IAutomation } from '../server/db/database'

export function matchAutomations(list: IAutomation[], url: string): IAutomation[] {
  return list.filter(item => {
    const { pattern } = item
    const regExp = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$")

    return regExp.test(url)
  })
}