import { isFromSE, isParamEqual } from "@src/helper/url";
import $ from "jquery";

import { BUILDIN_ACTIONS } from "../common/const";
import { Base } from "./Base";
import { ExecOptions } from "./types";

export interface ZenModeExecOptions extends ExecOptions {
  /**
   * How long to delay displaying the page
   */
  delay?: number;
  /**
   * Background Color
   */
  bgcolor?: string;
  /**
   * Font Color
   */
  color?: string;
  /**
   * Text to be displayed
   */
  word?: string;
}

export class ZenMode extends Base<ZenModeExecOptions> {
  name = BUILDIN_ACTIONS.ZEN_MODE;
  cls = "sh-zm-layer";
  style = ``;

  private layer;
  private timer = 0;

  execute(elem, options: Partial<ZenModeExecOptions>) {
    const { word = "Zen", delay, bgcolor, color } = options;
    const skey = "ex-hp-zen-pass";
    const passed = Boolean(window.sessionStorage.getItem(skey));

    if (passed) {
      return true;
    } else if (
      isParamEqual(window.location.href, "pass") ||
      isFromSE(document.referrer)
    ) {
      window.sessionStorage.setItem(skey, "1");
      return true;
    }

    if (!this.layer) {
      this.layer = $(`<div class="sh-zm-layer">${word}</div>`);

      if (bgcolor) {
        this.layer.css("background-color", bgcolor);
      }
      if (color) {
        this.layer.css("color", color);
      }

      $("body").append(this.layer);

      this.recordIfNeeded(options, elem);
    } else {
      this.layer.css("opacity", "1");
      this.layer.show();
    }

    if (delay) {
      const dtime = delay - 1 < 1 ? 1 : delay - 1;

      clearTimeout(this.timer);
      this.timer = window.setTimeout(() => {
        this.layer.css("opacity", "0");
        setTimeout(() => {
          this.layer.hide();
          window.sessionStorage.setItem(skey, "1");
        }, 1000);
      }, dtime * 1000);
    }

    return true;
  }
}
