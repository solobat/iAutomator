import Base, { defaultExecOptions, ExecOptions } from "./Base";
import { BUILDIN_ACTIONS } from "../common/const";

export default class KillElement extends Base {
  name = BUILDIN_ACTIONS.KILL_ELEMENT;

  exec(elem, options: ExecOptions) {
    elem.remove();
    this.helper.recordAction(BUILDIN_ACTIONS.KILL_ELEMENT, elem);

    if ((options || defaultExecOptions).metaKey) {
      requestAnimationFrame(() => {
        this.exec(elem, options);
      });
    }

    return true;
  }
}
