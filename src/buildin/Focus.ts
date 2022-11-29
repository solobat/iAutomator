import { BUILDIN_ACTIONS } from "../common/const";
import Base from "./Base";
import { ExecOptions } from "./types";

export default class FocusElement extends Base {
  name = BUILDIN_ACTIONS.FOCUS;

  execute(elem, options: Partial<ExecOptions>) {
    if (options.blur) {
      elem.blur();
    } else {
      elem.focus();
    }
    this.recordIfNeeded(options);

    return true;
  }
}
