import Base, { ExecOptions } from "./Base";
import { BUILDIN_ACTIONS } from "../common/const";
import $ from "jquery";

interface ZenModeExecOptions extends ExecOptions {
  delay?: number;
  bgcolor?: string;
  color?: string;
  word?: string;
}

export default class ZenMode extends Base<ZenModeExecOptions> {
  name = BUILDIN_ACTIONS.ZEN_MODE;
  shouldRecord = true;
  cls = "sh-zm-layer";
  style = ``;

  startByCommand() {
    this.execute(document.body, {});
  }

  private layer;
  private timer = 0;

  execute(elem, options?: ExecOptions) {
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
