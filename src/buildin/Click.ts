import { BUILDIN_ACTIONS } from "../common/const";
import Base from "./Base";
import { ExecOptions } from "./types";

export default class ClickElement extends Base {
  name = BUILDIN_ACTIONS.CLICK;

  execute(elem, options: Partial<ExecOptions>) {
    elem.click();
    this.recordIfNeeded(options);

    return true;
  }
}
