import Base, { defaultExecOptions, ExecOptions } from "./Base";
import { BUILDIN_ACTIONS } from "../common/const";

export default class KillElement extends Base {
  name = BUILDIN_ACTIONS.KILL_ELEMENT;

  execute(elem, options: ExecOptions) {
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
