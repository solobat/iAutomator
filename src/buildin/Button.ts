import Base, { ExecOptions, defaultExecOptions } from './base'
import { BUILDIN_ACTIONS } from '../common/const';
import $ = require('jquery')

type ButtonType = 'top' | 'toggle'
type ButtonPosition = 'tl' | 'tr' | 'bl' | 'br'

interface ButtonExecOptions extends ExecOptions {
  fixed?: boolean;
  pos?: ButtonPosition;
  type: ButtonType;
}

export default class Button extends Base {
  name = BUILDIN_ACTIONS.BUTTON
  cls: 'ext-hp-btn'
  style = `
    .ext-hp-btn { 
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      cursor: pointer;
      font-size: 12px;
      color: #8590a6;
      font-weight: 500;
      box-shadow: 0 1px 3px rgb(18 18 18 / 10%);
      border-radius: 4px;
    }
    .ext-hp-btn-top {
      position: fixed;
      bottom: 10px;
      right: 10px;
      background: #f2f3f4;
      z-index: 100000;
    }

    .ext-hp-btn-toggle {
      position: sticky;
      top: 5px;
      right: 5px;
      z-index: 100000;
      background: #fff;
      float: right;
    }

    .ext-hp-btn-link {
      position: fixed;
      background: #f2f3f4;
      z-index: 100000;
    }

    .ext-hp-btn-link.cr {
      top: 50%;
      right: 10px;
      transform: translateY(-50%);
    }
    
    .ext-hp-btn-link.cl {
      top: 50%;
      left: 10px;
      transform: translateY(-50%);
    }
  `

  shouldRedo = false
  
  shouldRecord = true

  start() {
    return
  }

  checkExecResult(elem, options?: ButtonExecOptions) {
    this.autoMationFn()
  }

  private createBtn(name: string, icon: string) {
    return $(`<div class="ext-hp-btn ext-hp-btn-${name}"><i class="iconfont ${icon}" /></div>`)
  }

  private insertTopButton(elem, options: ButtonExecOptions) {
    const $top = this.createBtn('top', 'icon-direction-up')

    $top.on('click', () => {
      document.body.scrollIntoView({
        behavior: 'smooth'
      })
    })

    $('body').append($top)
  }

  private insertToggleButton(scope: HTMLDocument, options: ButtonExecOptions) {
    let nextPageEl: any
    const { mh = 40} = options
    
    const insertButton = (el: any, next: any, isFirst: boolean) => {
      const $toggle = this.createBtn('toggle', 'icon-direction-down-circle')

      let [cur, reset] = [
        { height: `${mh}px`, overflow: 'hidden' }, 
        { height: 'auto', overflow: 'auto' }
      ];

      $toggle.on('click', () => {
        $toggle.parent().css(cur);

        if (cur.height !== 'auto') {
          if (next) {
            next.scrollIntoView()
          } else if (nextPageEl) {
            nextPageEl.scrollIntoView()
            nextPageEl = null
          }
        }
        [cur, reset] = [reset, cur];
      })

      $(el).addClass('ext-hp-toggled').prepend($toggle)

      if (isFirst) {
        nextPageEl = el
      }
    }

    function run() {
      const $elems = $(scope).find(options.item).not('.ext-hp-toggled')

      $elems.each((index, elem) => {
        insertButton(elem, $elems[index + 1], index === 0)
      })
    }

    this.helper.observe(scope, run)
  }

  private insertShortcut(elem: HTMLDivElement, options: ButtonExecOptions) {
    const { icon = 'icon-link', pos = 'cr' } = options
    const $icon = this.createBtn('link', icon).addClass(pos)

    $icon.on('click', () => {
      elem.click()
    })

    $('body').append($icon)
  }

  exec(elem, options: ButtonExecOptions) {
    const { type } = options
    this.helper.insertCss()
    if (type === 'top') {
      this.insertTopButton(elem, options)
    } else if (type === 'toggle') {
      this.insertToggleButton(elem, options)
    } else if (type === 'shortcut') {
      this.insertShortcut(elem, options)
    }

    return false
  }
}