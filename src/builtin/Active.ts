import { noticeBg } from "@src/helper/event";
import { BUILTIN_ACTIONS, PAGE_ACTIONS } from "../common/const";
import { Base } from "./Base";
import { ExecOptions } from "./types";

export class ActivePage extends Base {
  name = BUILTIN_ACTIONS.ACTIVE;

  execute(elem, options: Partial<ExecOptions>) {
    this.recordIfNeeded(options);

    noticeBg(
      {
        action: PAGE_ACTIONS.ACTIVE_PAGE,
      },
      () => {
        this.callNext(options, options);
      }
    );
    return true;
  }
}
