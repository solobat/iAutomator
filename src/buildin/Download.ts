import Base, { defaultExecOptions, ExecOptions } from './base'
import { BUILDIN_ACTIONS } from '../common/const';
import $ = require('jquery')
import { getHost } from '../helper/url';

export default class Download extends Base {
  name = BUILDIN_ACTIONS.DOWNLOAD
  shouldRecord = true
  
  private downloadURL(url, fileName?, type?) {
    if (url.startsWith('//')) {
      url = location.protocol + url
    }
    if (getHost(url) !== window.location.host) {
      window.open(url) 
    } else {
      const elem = document.createElement('a');
    
      elem.setAttribute('href', url);
      elem.setAttribute('download', fileName);
      document.body.appendChild(elem);
      elem.click();
    
      elem.remove();
    }
  }

  private getFileNameByURL(elem, url, type = 'file', ext?) {
    const baseName = elem.getAttribute('alt') || elem.getAttribute('title') || type
    if (!ext) {
      const m = url.match(/\.(\w+)$/)
      if (m) {
        ext = m[1]
      } else {
        ext = ''
      }
    }
  
    return `${baseName}.${ext}`
  }

  private downloadBg(elem): boolean {
    const bgImg = window.getComputedStyle(elem).backgroundImage
    const match = bgImg.match(/url\(["']?(.*\w)["']?\)/)
  
    if (match) {
      const url = match[1]
      this.downloadURL(url, this.getFileNameByURL(elem, url, 'background'))
  
      return true
    } else {
      return true
    }
  }

  private downloadSource(elem): boolean {
    const url = elem.getAttribute('src')
  
    if (url) {
      const tag = elem.tagName.toLowerCase()
  
      this.downloadURL(url, this.getFileNameByURL(elem, url, tag), tag)
  
      return true
    } else {
      return false
    } 
  }

  exec(elem, options?: ExecOptions) {
    const tagName = elem.tagName

    if (['VIDEO', 'IMG', 'AUDIO'].indexOf(tagName) !== -1) {
      const result = this.downloadSource(elem)
  
      if (result) {
        this.recordIfNeeded(options, elem)
      }
  
      return result
    } else {
      const result = this.downloadBg(elem)
  
      if (result) {
        this.recordIfNeeded(options, elem)
      }
  
      return result
    }
  }
}