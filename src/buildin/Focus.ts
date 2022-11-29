import Base, { ExecOptions } from "./Base";
import { BUILDIN_ACTIONS } from "../common/const";

export default class FocusElement extends Base {
  name = BUILDIN_ACTIONS.FOCUS;
  shouldRecord = true;

  execute(elem, options?: ExecOptions) {
    if (options.blur) {
      elem.blur();
    } else {
      elem.focus();
    }
    this.recordIfNeeded(options);

    return true;
  }
}
