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
      right: 1px;
      bottom: 1px;
      color: #8c8c8c;
    }
    .ext-hp-code-copy::after {
      content: "copy";
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

  exec(elem, options?: ExecOptions) {
    this.helper.insertCss()
    const elems = Array.from(document.querySelectorAll('code'))

    if (elems.length) {
      elems.forEach((codeElem) => {
        $(codeElem).append('<span class="ext-hp-code-copy"></span>');
        codeElem.parentElement.style.position = 'relative';
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