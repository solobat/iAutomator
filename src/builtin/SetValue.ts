import { BUILDIN_ACTIONS } from "../common/const";
import { Base } from "./Base";
import { ExecOptions } from "./types";

export interface SetValueExecOptions extends ExecOptions {
  value?: string;
}

export class SetValue extends Base {
  name = BUILDIN_ACTIONS.SET_VALUE;

  execute(elem, options: Partial<SetValueExecOptions>) {
    if (options.value) {
      elem.value = options.value;
      console.log("callnext", options);

      this.callNext();
    }
    this.recordIfNeeded(options);

    return true;
  }
}
