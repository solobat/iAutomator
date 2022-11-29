import $ from "jquery";
import keyboardJS from "keyboardjs";

import { BUILDIN_ACTIONS } from "../common/const";
import Base from "./Base";
import { ExecOptions } from "./types";

export default class GotoElement extends Base {
  name = BUILDIN_ACTIONS.GOTO_ELEMENT;
  cls = "ext-hp-goto-element";
  style = `
  `;

  private inited = false;

  checkExecResult() {
    if (!this.inited) {
      this.autoMationFn();
    }
  }

  private supportedFns = {
    siblingText: ($el) => $el[0].nextSibling,
    text: (textNode) => textNode.textContent,
    trim: (str) => str.trim(),
    number: (str) => Number(str),
  };

  private elems: HTMLElement[];
  private cursor = -1;

  private handleElems(elems: HTMLElement[], options: Partial<ExecOptions>) {
    if (options.handle) {
      const [selector, ...actions] = options.handle;
      const results = elems
        .map((elem) => {
          const $el = $(elem).find(selector);
          if ($el.length) {
            const result = actions.reduce((memo, action) => {
              const actionFn = this.supportedFns[action];
              if (actionFn) {
                memo = actionFn(memo);
              }

              return memo;
            }, $el);

            return {
              elem,
              result,
            };
          } else {
            return {
              elem: null,
              result: null,
            };
          }
        })
        .filter((item) => item.result);
      const orderBy = options.order || "asc";
      results.sort((a, b) => {
        if (orderBy === "desc") {
          return a.result > b.result ? 1 : -1;
        } else {
          return a.result > b.result ? -1 : 1;
        }
      });
      this.elems = results.map((item) => item.elem);
    } else {
      this.elems = elems;
    }
  }

  goto(offset = 1) {
    this.cursor += offset;

    const elem = this.elems[this.cursor];

    if (elem) {
      elem.scrollIntoView();
    } else {
      this.cursor += -offset;
    }
  }

  execute(elem, options?: ExecOptions) {
    const selected = options.to;
    const elems: HTMLElement[] = Array.from(
      document.querySelectorAll(selected)
    );

    if (elems.length) {
      this.handleElems(elems, options);

      if (options.auto) {
        this.goto(1);
      }

      keyboardJS.bind("command+shift+down", () => {
        this.goto(1);
      });
      keyboardJS.bind("command+shift+up", () => {
        this.goto(-1);
      });

      this.recordIfNeeded(options);
      this.inited = true;
    }

    return true;
  }
}
