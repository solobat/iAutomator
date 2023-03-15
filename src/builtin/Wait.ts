import { BUILDIN_ACTIONS } from "../common/const";
import { Base } from "./Base";
import { ExecOptions } from "./types";

export interface WaitExecOptions extends ExecOptions {
  time: number;
}

export class Wait extends Base {
  name = BUILDIN_ACTIONS.WAIT;

  execute(_, options: Partial<WaitExecOptions>) {
    const { time = 0 } = options;

    setTimeout(() => {
      this.callNext(options, options);
    }, time * 1000);

    this.recordIfNeeded(options);

    return true;
  }
}
