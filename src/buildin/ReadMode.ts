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

    if (options.metaKey) {
      this.initModePlus($elem)
    }
  
    this.recordIfNeeded(options, elem)

    return true
  }

  checkExecResult(elem, options?: ExecOptions) {
    const result = document.body.contains(elem)
    if (!result) {
      this.autoMationFn()
    }
  }

  private hideEl($el) {
    $el.css({
      visibility: 'hidden',
      opacity: 0
    }).addClass('s-a-rm-hn')
  }

  private showEl($el) {
    $el.css({
      visibility: 'visible',
      opacity: 1
    }).removeClass('s-a-rm-hn')
  }

  private layoutEl($el) {
    const top = $el.offset().top

    window.scrollTo(0, top - 200)
  }

  private initModePlus($el) {
    let cur = $el
    const fnCreator = fn => () => {
      this.hideEl(cur)
      const target = fn(cur)

      if (target && target.length) {
        cur = target
        this.showEl(target)
        this.layoutEl(target)
      }
    }
    const nextFn = fnCreator(cur => cur.next())
    const prevFn = fnCreator(cur => cur.prev())

    keyboardJS.bind('right', nextFn)
    keyboardJS.bind('left', prevFn)

    this.unbindFns.push(() => {
      keyboardJS.unbind('right', nextFn)
      keyboardJS.unbind('left', prevFn)
    })
  }

  private hideSiblings($el) {
    const that = this

    if ($el && $el.length) {
      this.hideEl($el.siblings().not('#steward-main,#wordcard-main'))
      this.hideSiblings($el.parent())
    } else {
      keyboardJS.bind('esc', function showNode() {
        that.showEl($('.s-a-rm-hn'))
        that.helper.resetActionCache();
        keyboardJS.unbind('esc', showNode);
        that.exit()
      });
    }
  }
}