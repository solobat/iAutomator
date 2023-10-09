import { BUILTIN_ACTIONS } from "../common/const";
import { Base } from "./Base";
import { ExecOptions } from "./types";

export class RequireExp extends Base {
  name = BUILTIN_ACTIONS.REQUIRE;

  execute(elem, options: Partial<ExecOptions>, effect?: (options: any) => any) {
    if (effect(options)) {
      this.callNext(options, options);
    }

    return true;
  }
}
