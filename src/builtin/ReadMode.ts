import $ from "jquery";

import { BUILTIN_ACTIONS } from "../common/const";
import { Base } from "./Base";
import { ActionHelper, ExecOptions } from "./types";

export interface ReadModeExecOptions extends ExecOptions {
  autoScroll?: boolean;
  metaKey?: boolean;
}
export class ReadMode extends Base {
  name = BUILTIN_ACTIONS.READ_MODE;
  cls = "s-a-rm-hn";
  private excludeSelectors = [
    "#steward-main",
    "#wordcard-main",
    ".sh-zm-layer",
    "#ext-hp-outline",
    ".ext-hp-btn",
  ];

  constructor(helper: ActionHelper<Base>) {
    super(helper, {
      shouldRecord: true,
      esc2exit: true,
      withOutline: true,
    });
  }

  execute(elem, options: Partial<ReadModeExecOptions>) {
    const $elem = $(elem);
    const { autoScroll = true, metaKey } = options;

    this.helper.actionCache.$elem = $elem;
    this.hideSiblings($elem);

    if (autoScroll) {
      elem.scrollIntoView();
    }

    if (metaKey) {
      this.initModePlus($elem);
    }

    this.helper.observe(elem, () => {
      this.active = true;
      this.hideSiblings($(elem));
    });

    return true;
  }

  checkExecResult(elem) {
    const result = document.body.contains(elem);
    if (!result) {
      this.autoMationFn();
    }
  }

  private hideEl($el) {
    $el
      .css({
        visibility: "hidden",
        opacity: 0,
      })
      .addClass(this.cls);
  }

  private showEl($el) {
    $el
      .css({
        visibility: "visible",
        opacity: 1,
      })
      .removeClass(this.cls);
  }

  private layoutEl($el) {
    const top = $el.offset().top;

    window.scrollTo(0, top - 200);
  }

  private initModePlus($el) {
    let cur = $el;
    const fnCreator = (fn) => () => {
      this.hideEl(cur);
      const target = fn(cur);

      if (target && target.length) {
        if (!target.hasClass(".s-a-rm-hn")) {
          this.hideSiblings(target);
        }
        cur = target;
        this.showEl(target);
        this.layoutEl(target);
      }
    };
    const nextFn = fnCreator((cur) => cur.next());
    const prevFn = fnCreator((cur) => cur.prev());

    this.helper.keyboard.bindKey("ArrowRight", nextFn);
    this.helper.keyboard.bindKey("ArrowLeft", prevFn);

    this.registerUnload(() => {
      this.helper.keyboard.unbindKey("ArrowRight", nextFn);
      this.helper.keyboard.unbindKey("ArrowLeft", prevFn);
    });
  }

  private get excludes() {
    if (this.runtimeOptions.excludes) {
      return (
        this.excludeSelectors.join(",") + "," + this.runtimeOptions.excludes
      );
    } else {
      return this.excludeSelectors.join(",");
    }
  }

  private hideSiblings($el) {
    if ($el && $el.length) {
      this.hideEl($el.siblings().not(this.excludes));
      this.hideSiblings($el.parent());
    } else {
      this.registerUnload(() => this.showEl($(this.selector)));
    }
  }
}
