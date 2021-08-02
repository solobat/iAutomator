import Base, { ExecOptions, defaultExecOptions } from './base'
import { BUILDIN_ACTIONS } from '../common/const';
import $ = require('jquery')

export default class FocusElement extends Base {
  name = BUILDIN_ACTIONS.FOCUS
  shouldRecord = true

  exec(elem, options?: ExecOptions) {
    if (options.blur) {
      elem.blur()
    } else {
      elem.focus()
    }
    this.recordIfNeeded(options)

    return true
  }
}