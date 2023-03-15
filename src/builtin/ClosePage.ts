import { BUILDIN_ACTIONS } from "../common/const";
import { Base } from "./Base";
import { ExecOptions } from "./types";

export class ClosePage extends Base {
  name = BUILDIN_ACTIONS.CLOSE_PAGE;

  execute(_, options: Partial<ExecOptions>) {
    window.close();
    this.recordIfNeeded(options);

    return true;
  }
}
