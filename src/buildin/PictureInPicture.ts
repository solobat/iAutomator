import { BUILDIN_ACTIONS, PAGE_ACTIONS } from "../common/const";
import { noticeBg } from "../helper/event";
import Base from "./Base";
import { ActionHelper, ExecOptions } from "./types";

export default class PictureInPicture extends Base {
  name = BUILDIN_ACTIONS.PICTURE_IN_PICTURE;

  private started = false;

  constructor(helper: ActionHelper<Base>) {
    super(helper, {
      defaultScope: document.querySelector("video"),
    });
  }

  private startPIP(elem) {
    elem.requestPictureInPicture();
    this.started = true;
  }

  private stopPIP() {
    document.exitPictureInPicture();
    this.started = false;
  }

  execute(elem, options: Partial<ExecOptions>) {
    if (document.pictureInPictureEnabled) {
      if (this.started) {
        this.stopPIP();
      } else {
        if (elem) {
          this.startPIP(elem);

          this.recordIfNeeded(options);
        } else {
          noticeBg({
            action: PAGE_ACTIONS.NOTICE,
            data: {
              title: "Video not found",
              message: `Action: PICTURE_IN_PICTURE`,
              iconUrl: chrome.runtime.getURL("/img/fail.png"),
            },
          });
        }
      }
    } else {
      noticeBg({
        action: PAGE_ACTIONS.NOTICE,
        data: {
          title: "PIP mode is invalid",
          message: `Action: PICTURE_IN_PICTURE`,
          iconUrl: chrome.runtime.getURL("/img/fail.png"),
        },
      });
    }

    return true;
  }
}
