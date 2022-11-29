import $ from "jquery";

import { BUILDIN_ACTIONS } from "../common/const";
import Base from "./Base";
import { ExecOptions } from "./types";

interface ZenModeExecOptions extends ExecOptions {
  delay?: number;
  bgcolor?: string;
  color?: string;
  word?: string;
}

export default class ZenMode extends Base<ZenModeExecOptions> {
  name = BUILDIN_ACTIONS.ZEN_MODE;
  cls = "sh-zm-layer";
  style = ``;

  private layer;
  private timer = 0;

  execute(elem, options: Partial<ZenModeExecOptions>) {
    const { word = "Zen", delay, bgcolor, color } = options;

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
        }, 1000);
      }, dtime * 1000);
    }

    return true;
  }
}
