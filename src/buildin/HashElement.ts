import Base, { ExecOptions, defaultExecOptions } from './base'
import { BUILDIN_ACTIONS } from '../common/const';
import $ = require('jquery')

export default class HashElements extends Base {
  name = BUILDIN_ACTIONS.HASH_ELEMENT
  cls: 'ext-hp-hashed'
  style = `
  `
  shouldRedo = true
  shouldRecord = true

  private shouldHashedTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']

  start() {
    this.exec(document.body, {})
  }

  exec(elem, options?: ExecOptions) {
    $(this.shouldHashedTags.join(',')).filter(`[id]:not(.${this.cls})`).on('click', function() {
      location.hash = this.getAttribute('id')
    }).addClass(this.cls)
  
    this.recordIfNeeded(options)

    return true
  }
}