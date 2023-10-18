import $ from "jquery";
import { BUILTIN_ACTIONS } from "../common/const";
import { Base } from "./Base";
import { ExecOptions } from "child_process";
import { ActionHelper } from "./types";
import { createTemplateHandler } from "@src/helper/str";
import { isURL, isURLLike } from "@src/helper/url";

const { extract: extractAttrs } = createTemplateHandler("[[", "]]");
const { extract: extractVars } = createTemplateHandler("{{", "}}");
export interface ModifyAttributesExecOptions extends ExecOptions {
  force?: boolean;
  attrs?: string;
}

export class ModifyAttributes extends Base<ModifyAttributesExecOptions> {
  name = BUILTIN_ACTIONS.ATTRIBUTES;

  constructor(helper: ActionHelper<Base>) {
    super(helper, {
      esc2exit: true,
      shouldRedo: true,
    });
  }

  private resolveNewValue(
    $elem: JQuery<HTMLElement>,
    key: string,
    attrVar?: string,
    innerVar?: string
  ) {
    const attrValue = attrVar ? $elem.attr(attrVar) : undefined;
    const resolveInnerValue = (varName: string) => {
      const oldValue = $elem.attr(key);
      if (varName === "target" && key === "href" && isURL(oldValue)) {
        return new URL(oldValue).searchParams.get("target");
      }

      if (varName === "value") {
        const val = $elem[0].textContent;

        if ($elem[0].tagName === "A") {
          if (val && val.includes(".")) {
            return isURLLike(val) ? val : `https://${val}`;
          }
        } else {
          return val;
        }
      }
    };
    const innerValue = innerVar ? resolveInnerValue(innerVar) : undefined;

    return attrValue || innerValue;
  }

  private isValidValue(key: string, val?: string) {
    return ["href", "src"].includes(key) && isURLLike(val);
  }

  private modify(
    elem: HTMLElement,
    options: Partial<ModifyAttributesExecOptions>
  ) {
    const $el = $(elem);
    const attrs = options.attrs.split(",").map((attr) => attr.split("="));
    attrs.forEach((pair) => {
      const [key, value] = pair;
      const attrVar = extractAttrs(value).shift();
      const innerVar = extractVars(value).shift();

      $el.filter(`[${key}]`).each((_, elem) => {
        const $target = $(elem);
        const oldValue = $target.attr(key);
        this.registerUnload(() => {
          $target.attr(key, oldValue);
        });
        const val =
          this.resolveNewValue($target, key, attrVar, innerVar) || value;

        if (this.isValidValue(key, val)) {
          $target.attr(key, String(val));
        }
      });
    });

    if (options.force) {
      this.forceAnchor($el, options);
    }
  }

  private forceAnchor(
    $el: JQuery<HTMLElement>,
    options: Partial<ModifyAttributesExecOptions>
  ) {
    if ($el.is("a") && options["target"] === "_self") {
      const handler = function (event) {
        event.stopPropagation();
        event.preventDefault();
        window.location.href = $(this).attr("href");
      };
      $("body").on("click", "a", handler);

      this.registerUnload(() => {
        $("body").off("click", "a", handler);
      });
    }
  }

  execute(elem, options: Partial<ModifyAttributesExecOptions>) {
    this.modify(elem, options);
    this.callNext(options, options);

    return true;
  }
}
