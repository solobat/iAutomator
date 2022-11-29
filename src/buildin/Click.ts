import Base, { ExecOptions } from "./Base";
import { BUILDIN_ACTIONS } from "../common/const";

export default class ClickElement extends Base {
  name = BUILDIN_ACTIONS.CLICK;
  shouldRecord = true;

  execute(elem, options?: ExecOptions) {
    elem.click();
    this.recordIfNeeded(options);

    return true;
  }
}
