import { BUILTIN_ACTIONS } from "../common/const";
import { Base } from "./Base";
import { ExecOptions } from "./types";

export class ClosePage extends Base {
  name = BUILTIN_ACTIONS.CLOSE_PAGE;

  execute(_, options: Partial<ExecOptions>) {
    window.close();

    return true;
  }
}
