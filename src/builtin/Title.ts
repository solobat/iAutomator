import { BUILTIN_ACTIONS } from "../common/const";
import { Base } from "./Base";
import { ExecOptions } from "./types";

interface SetTitleExecOptions extends ExecOptions {
  title: string;
}

export class SetTitle extends Base {
  name = BUILTIN_ACTIONS.TITLE;

  execute(elem, options: Partial<SetTitleExecOptions>) {
    let title = "";

    if (elem.tagName !== "BODY") {
      title = elem.innerText;
    } else {
      title = options.title;
    }

    const originTitle = document.title;
    document.title = title;
    this.registerUnload(() => {
      document.title = originTitle;
    });
    this.recordIfNeeded(options);

    return true;
  }
}
