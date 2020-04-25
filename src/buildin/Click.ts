import Base, { ExecOptions, defaultExecOptions } from './base'
import { BUILDIN_ACTIONS } from '../common/const';
import $ = require('jquery')

export default class ClickElement extends Base {
  name = BUILDIN_ACTIONS.CLICK
  shouldRecord = true


  exec(elem, options?: ExecOptions) {
    elem.click()
    this.recordIfNeeded(options)

    return true
  }
}