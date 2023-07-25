import { BUILTIN_ACTIONS } from "../common/const";
import { Base } from "./Base";
import { ActionHelper, ExecOptions } from "./types";

export class ProtectPage extends Base {
  name = BUILTIN_ACTIONS.PROTECT;
  private rawTitle: string;

  constructor(helper: ActionHelper<Base>) {
    super(helper, {});
    this.rawTitle = document.title;
  }

  execute(elem, options: Partial<ExecOptions>) {
    document.title = `Locked:${this.rawTitle}`;
    window.onbeforeunload = function () {
      return "This page has been protect by yourself";
    };
    this.recordIfNeeded(options);
    this.registerUnload(() => {
      document.title = this.rawTitle;
      window.onbeforeunload = null;
    });

    return true;
  }
}
