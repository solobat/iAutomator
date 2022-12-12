import { BUILDIN_ACTIONS } from "../common/const";
import { Base } from "./Base";
import { ExecOptions } from "./types";

export class AllowCopying extends Base {
  name = BUILDIN_ACTIONS.ALLOW_COPYING;

  execute(elem: HTMLElement, options: Partial<ExecOptions>) {
    elem.addEventListener("copy", (event) => {
      event.clipboardData.setData(
        "text/plain",
        window.getSelection().toString()
      );
    });

    return true;
  }
}
