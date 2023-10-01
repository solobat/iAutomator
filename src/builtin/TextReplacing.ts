import $ from "jquery";
import { BUILTIN_ACTIONS } from "../common/const";
import { Base } from "./Base";
import { ExecOptions } from "./types";

export interface TextReplacingExecOptions extends ExecOptions {
  rules?: string;
  selector?: string;
}

export class TextReplacing extends Base<TextReplacingExecOptions> {
  name = BUILTIN_ACTIONS.TEXT_REAPLCING;

  private replace(options: Partial<TextReplacingExecOptions>) {
    Array.from($(options.selector)).forEach((elem) => {
      let text = elem.innerText;

      if (text) {
        const rules = options.rules.split(",");

        rules.forEach((rule) => {
          const [from, to] = rule.split("=");

          text = text.replace(new RegExp(from, "g"), to);
        });
        elem.innerText = text;
      }
    });
  }

  execute(elem, options: Partial<TextReplacingExecOptions>) {
    this.replace(options);
    this.callNext(options, options);

    return true;
  }
}
