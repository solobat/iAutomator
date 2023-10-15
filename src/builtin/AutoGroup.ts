import { BUILTIN_ACTIONS } from "../common/const";
import { Base } from "./Base";
import { ExecOptions } from "./types";

interface AutoGroupExecOptions extends ExecOptions {
  name: string;
}

export class AutoGroupTab extends Base {
  name = BUILTIN_ACTIONS.AUTO_GROUP;

  execute(elem, options: Partial<AutoGroupExecOptions>) {
    this.helper.autoGroupTab(options.name);
    return true;
  }
}
