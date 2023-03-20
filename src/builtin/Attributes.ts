import $ from "jquery";
import { BUILTIN_ACTIONS } from "../common/const";
import { Base } from "./Base";

export interface ModifyAttributesExecOptions {
  force?: boolean;
}

export class ModifyAttributes extends Base<ModifyAttributesExecOptions> {
  name = BUILTIN_ACTIONS.ATTRIBUTES;

  private modify(
    elem: HTMLElement,
    options: Partial<ModifyAttributesExecOptions>
  ) {
    const $el = $(elem);

    Object.entries(options).forEach((pair) => {
      const [key, value] = pair;

      $el.filter(`[${key}]`).attr(key, String(value));
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
      $("body").on("click", "a", function (event) {
        event.stopPropagation();
        event.preventDefault();
        window.location.href = $(this).attr("href");
      });
    }
  }

  execute(elem, options: Partial<ModifyAttributesExecOptions>) {
    this.modify(elem, options);
    this.recordIfNeeded(options);
    this.callNext(options, options);

    return true;
  }
}
