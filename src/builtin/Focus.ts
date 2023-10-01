import { BUILTIN_ACTIONS } from "../common/const";
import { Base } from "./Base";
import { ExecOptions } from "./types";

export class FocusElement extends Base {
  name = BUILTIN_ACTIONS.FOCUS;

  execute(elem, options: Partial<ExecOptions>) {
    if (options.blur) {
      elem.blur();
    } else {
      elem.focus();
    }

    return true;
  }
}
