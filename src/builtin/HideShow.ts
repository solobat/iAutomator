import $ from "jquery";

import { BUILTIN_ACTIONS } from "../common/const";
import { Base } from "./Base";
import { ActionHelper, ExecOptions } from "./types";

export interface HideShowExecOptions extends ExecOptions {
  /** true = show (visible), false = hide (visibility: hidden, same as ReadMode) */
  visible?: boolean;
}

const HIDE_CLS = "s-a-hide-show-hidden";

export class HideShow extends Base {
  name = BUILTIN_ACTIONS.HIDE_SHOW;

  cls = HIDE_CLS;

  style = `.${HIDE_CLS}{visibility:hidden!important;opacity:0!important;}`;

  constructor(helper: ActionHelper<Base>) {
    super(helper, {
      shouldRecord: true,
      esc2exit: false,
    });
  }

  execute(elem: Element | null, options: Partial<HideShowExecOptions>) {
    const scope = (options?.scope as string) || "body";
    const visible = options?.visible !== false;
    const $els = $(scope);

    if (!$els.length) {
      return false;
    }

    if (visible) {
      $els.removeClass(this.cls);
      return true;
    }

    $els.addClass(this.cls);
    this.registerUnload(() => {
      $els.removeClass(this.cls);
    });
    return true;
  }
}
