import $ from "jquery";

import { BUILTIN_ACTIONS } from "../common/const";
import { copyToClipboard } from "../helper/others";
import { Base } from "./Base";
import { ActionHelper, ExecOptions } from "./types";

export type CodeCopyBtnPosition = "tr" | "tl";
export interface CodeCopyExecOptions extends ExecOptions {
  /**
   * Whether the code is in <pre /> tag
   */
  inpre?: boolean;
  /**
   * Whether the code tag is <pre />
   */
  pre?: boolean;
  /**
   * Acting on the block-level code
   */
  block?: boolean;
  /**
   * Acting on the inline-level code
   */
  inline?: boolean;
  /**
   * The css-selector of elements to be removed
   */
  rm?: string;
  /**
   * Position of Btn: tr | tl
   */
  pos?: CodeCopyBtnPosition;
}

export class CodeCopy extends Base<CodeCopyExecOptions> {
  name = BUILTIN_ACTIONS.CODE_COPY;
  cls = "ext-hp-code-copy";

  private inited = false;

  constructor(helper: ActionHelper<Base, CodeCopyExecOptions>) {
    super(helper, {
      defaultArgs: {
        block: true,
        inline: true,
        inpre: true,
      },
    });
  }

  checkExecResult() {
    if (!this.inited) {
      this.autoMationFn();
    }
  }

  private getPositionCls(position = "tl") {
    return `ext-hp-code-copy-${position}`;
  }

  private insertCopyBtn(
    codeElem: HTMLElement,
    options: Partial<CodeCopyExecOptions>
  ) {
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

  private handleBlockCode(options: Partial<CodeCopyExecOptions>): boolean {
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

  private handleInlineCode(options: Partial<CodeCopyExecOptions>): boolean {
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

  execute(elem, options: Partial<CodeCopyExecOptions>) {
    const blockResult = this.handleBlockCode(options);
    const inlineResult = this.handleInlineCode(options);

    if (blockResult || inlineResult) {
      this.inited = true;
    } else {
      this.recordable = false;
    }

    return true;
  }
}
