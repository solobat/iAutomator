import Base, { ExecOptions, defaultExecOptions } from './base'
import { BUILDIN_ACTIONS } from '../common/const';
import keyboardJS from 'keyboardjs'
import $ = require('jquery')
import { isSunset } from '../helper/sun';

interface DarkModeOptions extends ExecOptions {
  lat: string;
  long: string;
}

export default class DarkMode extends Base {
  name = BUILDIN_ACTIONS.DARK_MODE
  shouldRecord = true

  private theme = 'sh-dm-dark-mode'

  private EXIT_SHORTCUT = 'esc'

  private defaultOptions: DarkModeOptions = {
    lat: '39.9',
    long: '116.3'
  }

  style = `
  html[theme='sh-dm-dark-mode'] {
    filter: invert(1) hue-rotate(180deg);
  }
  html[theme='sh-dm-dark-mode'] img,
  picture,
  video{
      filter: invert(1) hue-rotate(180deg);
  }
  `

  start() {
    this.exec(document.body, {
      lat: '39.9',
      long: '116.3'
    })
  }

  private shouldStart(options = this.defaultOptions) {
    const { lat = this.defaultOptions.lat,
      long = this.defaultOptions.long } = options; 
    const flag = isSunset(parseInt(lat), parseInt(long));

    return flag
  }

  exec(elem, options?: DarkModeOptions) {
    if (!this.shouldStart(options)) {
      return
    }

    this.helper.insertCss()
    $('html').attr('theme', this.theme)
    
    this.recordIfNeeded(options, elem)
    
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