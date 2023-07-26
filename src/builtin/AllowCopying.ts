import { BUILTIN_ACTIONS } from "../common/const";
import { Base } from "./Base";
import { ExecOptions } from "./types";

export class AllowCopying extends Base {
  name = BUILTIN_ACTIONS.ALLOW_COPYING;

  execute(elem: HTMLElement, options: Partial<ExecOptions>) {
    const handler = (event) => {
      event.clipboardData.setData(
        "text/plain",
        window.getSelection().toString()
      );
    };
    elem.addEventListener("copy", handler);

    this.registerUnload(() => {
      elem.removeEventListener("copy", handler);
    });

    return true;
  }
}
