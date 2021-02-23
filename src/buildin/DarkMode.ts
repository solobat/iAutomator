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