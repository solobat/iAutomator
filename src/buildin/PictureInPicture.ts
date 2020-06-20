import Base, { ExecOptions, defaultExecOptions } from './base'
import { BUILDIN_ACTIONS, PAGE_ACTIONS } from '../common/const';
import { noticeBg } from '../helper/event';

declare global {
  interface Document { pictureInPictureEnabled: boolean; exitPictureInPicture: Function; }
}

export default class PictureInPicture extends Base {
  name = BUILDIN_ACTIONS.PICTURE_IN_PICTURE
  shouldRecord = true

  private started: boolean = false

  start() {
    this.exec(document.querySelector('video'), {})
  }

  private startPIP(elem) {
    elem.requestPictureInPicture()
    this.started = true;
  }

  private stopPIP() {
    document.exitPictureInPicture();
    this.started = false;
  }

  exec(elem, options?: ExecOptions) {
    if (document.pictureInPictureEnabled) {
      if (this.started) {
        this.stopPIP();
      } else {
        if (elem) {
          this.startPIP(elem);
  
          this.recordIfNeeded(options)
        } else {
          noticeBg({
            action: PAGE_ACTIONS.NOTICE,
            data: {
              title: 'Video not found', 
              message: `Action: PICTURE_IN_PICTURE`,
              iconUrl: chrome.extension.getURL('/img/fail.png')
            }
          })
        }
      }
    } else {
      noticeBg({
        action: PAGE_ACTIONS.NOTICE,
        data: {
          title: 'PIP mode is invalid', 
          message: `Action: PICTURE_IN_PICTURE`,
          iconUrl: chrome.extension.getURL('/img/fail.png')
        }
      })
    }

    return true
  }
}