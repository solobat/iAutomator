import Base, { ExecOptions, defaultExecOptions } from "./Base";
import { BUILDIN_ACTIONS } from "../common/const";
import { copyToClipboard } from "../helper/others";
import $ from "jquery";

interface CodeCopyExecOptions extends ExecOptions {
  inpre?: boolean;
  pre?: boolean;
  block?: boolean;
  inline?: boolean;
  rm?: string;
  pos?: string;
}

export default class CodeCopy extends Base {
  name = BUILDIN_ACTIONS.CODE_COPY;
  cls = "ext-hp-code-copy";

  shouldRedo = true;

  shouldRecord = true;

  private inited = false;

  start() {
    this.exec(document.body, {
      block: true,
      inline: true,
      inpre: true,
    });
  }

  checkExecResult(elem, options?: CodeCopyExecOptions) {
    if (!this.inited) {
      this.autoMationFn();
    }
  }

  private getPositionCls(position = "tl") {
    return `ext-hp-code-copy-${position}`;
  }

  private insertCopyBtn(codeElem: HTMLElement, options?: CodeCopyExecOptions) {
    const position = options ? options.pos : "tl";

    if (options.inpre) {
      codeElem.parentElement.style.position = "relative";
    } else {
      codeElem.style.position = "relative";
    }
    $(codeElem).append(
      `<span class="ext-hp-code-copy iconfont icon-copy ${this.getPositionCls(
        position
      )}"></span>`
    );
    if (options.rm) {
      $(codeElem).find(options.rm).remove();
    }
  }

  private handleBlockCode(options?: CodeCopyExecOptions): boolean {
    if (options.block !== false) {
      const selected = options.pre ? "pre" : "code";
      const elems = Array.from(document.querySelectorAll(selected));

      if (elems.length) {
        elems.forEach((codeElem) => {
          if (options.inpre) {
            if (codeElem.parentElement.tagName === "PRE") {
              this.insertCopyBtn(codeElem, options);
            }
          } else {
            this.insertCopyBtn(codeElem, options);
          }
        });
        $(document).on("click", ".ext-hp-code-copy", function () {
          const text = this.parentElement.textContent;
          copyToClipboard(text);
        });

        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  private handleInlineCode(options?: CodeCopyExecOptions): boolean {
    if (options.inline) {
      const validTags = ["P", "LI", "TD"];
      const inlineElems = Array.from(document.querySelectorAll("code")).filter(
        (elem) => validTags.indexOf(elem.parentElement.tagName) !== -1
      );

      if (inlineElems.length) {
        inlineElems.forEach((elem) => {
          elem.className += " ext-hp-inlinecode-copy";
        });
        $(document).on("click", ".ext-hp-inlinecode-copy", function () {
          const text = this.textContent;
          copyToClipboard(text);
        });

        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  exec(elem, options?: CodeCopyExecOptions) {
    const blockResult = this.handleBlockCode(options);
    const inlineResult = this.handleInlineCode(options);

    if (blockResult || inlineResult) {
      this.recordIfNeeded(options);
      this.inited = true;
    }

    return true;
  }
}
