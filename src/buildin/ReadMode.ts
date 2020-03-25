import Base, { ExecOptions, defaultExecOptions } from './base'
import { BUILDIN_ACTIONS } from '../common/const';
import keyboardJS = require('keyboardjs')
import $ = require('jquery')

export default class ReadMode extends Base {
  name = BUILDIN_ACTIONS.READ_MODE
  shouldRecord = true
  
  exec(elem, options?: ExecOptions) {
    const $elem = $(elem)
  
    this.helper.actionCache.$elem = $elem;
    this.hideSiblings($elem);
  
    elem.scrollIntoView();
  
    this.recordIfNeeded(options, elem)

    return true
  }

  private hideSiblings($el) {
    const that = this

    if ($el && $el.length) {
      $el.siblings().not('#steward-main,#wordcard-main').css({
        visibility: 'hidden',
        opacity: 0
      }).addClass('s-a-rm-hn');
      this.hideSiblings($el.parent())
    } else {
      console.log('Enter reading mode');
      keyboardJS.bind('esc', function showNode() {
        $('.s-a-rm-hn').css({
          visibility: 'visible',
          opacity: 1
        }).removeClass('s-a-rm-hn');
        console.log('Exit reading mode');
        that.helper.resetActionCache();
        keyboardJS.unbind('esc', showNode);
      });
    }
  }
}