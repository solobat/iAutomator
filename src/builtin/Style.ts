import { BUILTIN_ACTIONS } from "../common/const";
import { Base } from "./Base";
import { ActionHelper, ExecOptions } from "./types";

interface StyleOptions extends ExecOptions {
  type?: "full" | "other";
  content?: string;
}

export class SetStyle extends Base {
  name = BUILTIN_ACTIONS.STYLE;

  cls = "ih-style";

  constructor(helper: ActionHelper<Base>) {
    super(helper, {
      esc2exit: true,
    });
  }

  execute(elem, options: Partial<StyleOptions>) {
    if (options.content) {
      const originalContent = $(elem).css("cssText");
      $(elem).css({
        cssText: options.content,
      });
      this.registerUnload(() => {
        $(elem).css({
          cssText: originalContent,
        });
      });
    } else if (options.type === "full") {
      elem.classList.add(`${this.cls}-${options.type}`);
      this.registerUnload(() => {
        elem.classList.remove(`${this.cls}-${options.type}`);
      });
    }
    this.recordIfNeeded(options);
    setTimeout(() => {
      this.callNext(options, options);
    }, 1000);

    return true;
  }
}
