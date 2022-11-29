import { BUILDIN_ACTIONS } from "../common/const";
import Base from "./Base";
import { ActionHelper, defaultExecOptions, ExecOptions } from "./types";

export default class KillElement extends Base {
  name = BUILDIN_ACTIONS.KILL_ELEMENT;

  constructor(helper: ActionHelper<Base>) {
    super(helper, {
      withOutline: true,
    });
  }

  execute(elem, options: Partial<ExecOptions>) {
    elem.remove();
    this.helper.recordAction(BUILDIN_ACTIONS.KILL_ELEMENT, elem);

    if ((options || defaultExecOptions).metaKey) {
      requestAnimationFrame(() => {
        this.execute(elem, options);
      });
    }

    return true;
  }
}
