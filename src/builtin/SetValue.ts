import { BUILTIN_ACTIONS } from "../common/const";
import { Base } from "./Base";
import { ExecOptions } from "./types";

export interface SetValueExecOptions extends ExecOptions {
  value?: string;
}

export class SetValue extends Base {
  name = BUILTIN_ACTIONS.SET_VALUE;

  execute(elem, options: Partial<SetValueExecOptions>) {
    if (options.value) {
      let originValue = "";
      if (elem.tagName === "DIV") {
        originValue = elem.innerText;
        elem.innerText = options.value;
      } else {
        originValue = elem.value;
        elem.value = options.value;
      }
      this.registerUnload(() => {
        if (elem.tagName === "DIV") {
          elem.innerText = originValue;
        } else {
          elem.value = originValue;
        }
      });

      this.callNext(options, options);
    }

    return true;
  }
}
