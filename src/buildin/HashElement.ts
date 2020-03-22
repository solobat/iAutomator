import Base, { ExecOptions, defaultExecOptions } from './base'
import { BUILDIN_ACTIONS } from '../common/const';
import $ = require('jquery')

export default class HashElements extends Base {
  name = BUILDIN_ACTIONS.HASH_ELEMENT
  cls: 'ext-hp-hashed'
  style = `
    .ext-hp-hashed { cursor: pointer;}
  `
  private shouldHashedTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']

  start() {
    this.exec(document.body)
  }

  exec(elem, options?: ExecOptions) {
    this.helper.insertCss()
    $(this.shouldHashedTags.join(',')).filter(`[id]:not(.${this.cls})`).on('click', function() {
      location.hash = this.getAttribute('id')
    }).addClass(this.cls)
  
    if (!(options || defaultExecOptions).silent) {
      this.helper.recordAction(BUILDIN_ACTIONS.HASH_ELEMENT)
    }

    return true
  }
}