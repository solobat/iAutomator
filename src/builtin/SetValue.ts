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
      if (elem.tagName === "DIV") {
        elem.innerText = options.value;
      } else {
        elem.value = options.value;
      }

      this.callNext(options, options);
    }
    this.recordIfNeeded(options);

    return true;
  }
}
