import Base, { ExecOptions, defaultExecOptions } from './base'
import { BUILDIN_ACTIONS } from '../common/const';
import $ = require('jquery')
import { copyToClipboard } from '../helper/others';

export default class CodeCopy extends Base {
  name = BUILDIN_ACTIONS.CODE_COPY
  cls: 'ext-hp-code-copy'
  style = `
    .ext-hp-code-copy { 
      cursor: pointer;
      position: absolute;
      font-size: 12px;
      color: #8c8c8c;
    }
    .ext-hp-code-copy-tl {
      left: 1px;
      top: 1px;
    }
    .ext-hp-code-copy-tr {
      right: 1px;
      top: 1px;
    }
    .ext-hp-code-copy::after {
      content: "\\e618";
    }
  `
  shouldRecord = true

  private inited = false

  start() {
    this.exec(document.body, {}) 
  }

  checkExecResult(elem, options?: ExecOptions) {
    if (!this.inited) {
      this.autoMationFn()
    }
  }

  private getPositionCls(position = 'tl') {
    return `ext-hp-code-copy-${position}`
  }

  private insertCopyBtn(codeElem: HTMLElement, options?: ExecOptions) {
    const position = options ? options.pos : 'tl'

    if (options.inpre) {
      codeElem.parentElement.style.position = 'relative';
    } else {
      codeElem.style.position = 'relative';
    }
    $(codeElem).append(`<span class="ext-hp-code-copy iconfont ${this.getPositionCls(position)}"></span>`);
    if (options.rm) {
      $(codeElem).find(options.rm).remove();
    }
  }

  exec(elem, options?: ExecOptions) {
    this.helper.insertCss()

    const selected = options.pre ? 'pre' : 'code';
    const elems = Array.from(document.querySelectorAll(selected))

    if (elems.length) {
      elems.forEach((codeElem) => {
        if (options.inpre) {
          if (codeElem.parentElement.tagName === 'PRE') {
            this.insertCopyBtn(codeElem, options);
          }
        } else {
          this.insertCopyBtn(codeElem, options);
        }
      })
      $(document).on('click', '.ext-hp-code-copy', function() {
        const text = this.parentElement.textContent
        copyToClipboard(text)
      })
    
      this.recordIfNeeded(options)
      this.inited = true
    }

    return true
  }
}