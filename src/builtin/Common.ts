import { BUILTIN_ACTIONS, COMMON_ACTIONS } from "../common/const";
import { Base } from "./Base";
import { ExecOptions } from "./types";

interface CommonExecOptions extends ExecOptions {
  action: keyof typeof COMMON_ACTIONS;
}
const actionFns = {};

export class CommonAction extends Base {
  name = BUILTIN_ACTIONS.COMMON;

  execute(elem, options: Partial<CommonExecOptions>) {
    const { action } = options;

    const fn = actionFns[action];

    fn?.();
    this.recordIfNeeded(options);

    return true;
  }
}
