import { BUILDIN_ACTIONS } from "../common/const";
import { Base } from "./Base";
import { ExecOptions } from "./types";

export class ClickElement extends Base {
  name = BUILDIN_ACTIONS.CLICK;

  execute(elem, options: Partial<ExecOptions>) {
    elem.click();
    this.recordIfNeeded(options);
    setTimeout(() => {
      this.callNext(options);
    }, 1000);

    return true;
  }
}
