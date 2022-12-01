import $ from "jquery";
import keyboardJS from "keyboardjs";

import { BUILDIN_ACTIONS } from "../common/const";
import { Base } from "./Base";
import { ActionHelper, ExecOptions } from "./types";

export class ReadMode extends Base {
  name = BUILDIN_ACTIONS.READ_MODE;
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

  execute(elem, options: Partial<ExecOptions>) {
    const $elem = $(elem);

    this.helper.actionCache.$elem = $elem;
    this.hideSiblings($elem);

    elem.scrollIntoView();

    if (options.metaKey) {
      this.initModePlus($elem);
    }

    this.helper.observe(elem, () => {
      this.hideSiblings($(elem));
    });

    this.recordIfNeeded(options, elem);

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

    keyboardJS.bind("right", nextFn);
    keyboardJS.bind("left", prevFn);

    this.resetFns.push(() => {
      keyboardJS.unbind("right", nextFn);
      keyboardJS.unbind("left", prevFn);
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
      this.resetFns.push(() => this.showEl($(this.selector)));
    }
  }
}
