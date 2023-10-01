import { BUILTIN_ACTIONS } from "../common/const";
import { Base } from "./Base";
import { ExecOptions } from "./types";

export class ClickElement extends Base {
  name = BUILTIN_ACTIONS.CLICK;

  execute(elem, options: Partial<ExecOptions>) {
    elem.click();
    setTimeout(() => {
      this.callNext(options, options);
    }, 1000);

    return true;
  }
}
