import Base, { ExecOptions, defaultExecOptions } from './base'
import { BUILDIN_ACTIONS } from '../common/const';
import keyboardJS from 'keyboardjs'
import $ = require('jquery')
import { isDark } from '../helper/sun';

interface DarkModeOptions extends ExecOptions {
  lat?: string;
  long?: string;
}

export default class DarkMode extends Base {
  name = BUILDIN_ACTIONS.DARK_MODE
  shouldRecord = true

  private theme = 'sh-dm-dark-mode'

  private EXIT_SHORTCUT = 'esc'

  private defaultOptions: DarkModeOptions = {
    lat: '',
    long: ''
  }

  style = `
  html[theme='sh-dm-dark-mode'] {
    filter: invert(1) hue-rotate(180deg);
  }
  html[theme='sh-dm-dark-mode'] img,
  html[theme='sh-dm-dark-mode'] picture,
  html[theme='sh-dm-dark-mode'] video,
  html[theme='sh-dm-dark-mode'] [style*='background-image']
  {
    filter: invert(1) hue-rotate(180deg);
  }
  `

  start() {
    this.exec(document.body, {})
  }

  private shouldStart(options = this.defaultOptions) {
    const { lat, long } = options; 

    if (lat && long) {
      const flag = isDark(parseInt(lat), parseInt(long));
  
      return flag
    } else {
      return true;
    }
  }

  exec(elem, options?: DarkModeOptions) {
    if (!this.shouldStart(options)) {
      return
    }

    this.helper.insertCss()
    $('html').attr('theme', this.theme)
    
    this.recordIfNeeded(options)
    
    this.unbindFns.push(() => {
      $('html').attr('theme', '')
    })
    
    const that = this
    keyboardJS.bind(this.EXIT_SHORTCUT, function exitDarkMode() {
      keyboardJS.unbind(that.EXIT_SHORTCUT, exitDarkMode);
      that.exit()
    });
    
    return true
  }
}