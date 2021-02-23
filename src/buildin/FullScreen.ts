import Base, { ExecOptions } from './base'
import { BUILDIN_ACTIONS } from '../common/const';
import $ = require('jquery')

export default class FullScreen extends Base {
  name = BUILDIN_ACTIONS.FULL_SCREEN
  cls: string = 'ext-hp-fullscreen'

  private unsetFullScreenElem: Function

  private setupFullScreenElem(elem, event) {
    const pv = (window.innerHeight - elem.clientHeight) / 2
    const ph = (window.innerWidth - elem.clientWidth) / 2
    const bgc = window.getComputedStyle(elem).backgroundColor
    const ovf = elem.clientHeight > window.innerHeight
    const paddings = []

    elem.setAttribute('data-padding', elem.style.padding)
    if (event.metaKey) {
      $(elem).addClass(this.cls)
    }
    if (pv > 0) {
      paddings.push(`${pv}px`)
    } else {
      paddings.push('0')
    }
    if (ph > 0) {
      paddings.push(`${ph}px`)
    } else {
      paddings.push('0')
    }

    elem.style.padding = paddings.join(' ')

    if (bgc === 'rgba(0, 0, 0, 0)') {
      elem.setAttribute('data-bgc', bgc)
      elem.style.backgroundColor = '#fff'
    }
    if (ovf) {
      elem.setAttribute('data-ovf', elem.style.overflow)
      elem.style.overflow = 'auto'
    }

    return () => {
      elem.style.padding = elem.getAttribute('data-padding')
      if (elem.hasAttribute('data-bgc')) {
        elem.style.backgroundColor = elem.getAttribute('data-bgc')
      }
      if (ovf) {
        elem.style.overflow = elem.getAttribute('data-ovf')
      }
      $(elem).removeClass(this.cls)
    }
  }

  bindEvents() {
    document.addEventListener("fullscreenchange", ( event ) => {
      if (!document.fullscreenElement) {
        if (this.unsetFullScreenElem) {
          this.unsetFullScreenElem()
        }
      }
    });
  }

  exec(elem, options?: ExecOptions) {
    if (elem.requestFullscreen) {
      this.unsetFullScreenElem = this.setupFullScreenElem(elem, event)
      requestAnimationFrame(() => {
        elem.requestFullscreen()
      })

      return true
    } else {
      return false
    }
  }
}