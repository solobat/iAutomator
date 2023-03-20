import { BUILTIN_ACTIONS } from "../common/const";
import { Base } from "./Base";
import { ActionHelper, defaultExecOptions, ExecOptions } from "./types";

export class KillElement extends Base {
  name = BUILTIN_ACTIONS.KILL_ELEMENT;

  constructor(helper: ActionHelper<Base>) {
    super(helper, {
      withOutline: true,
    });
  }

  execute(elem, options: Partial<ExecOptions>) {
    elem.remove();
    this.helper.recordAction(BUILTIN_ACTIONS.KILL_ELEMENT, elem);

    if ((options || defaultExecOptions).metaKey) {
      requestAnimationFrame(() => {
        this.execute(elem, options);
      });
    }

    return true;
  }
}
