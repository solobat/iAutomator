import { BUILTIN_ACTIONS, COMMON_ACTIONS } from "../common/const";
import { Base } from "./Base";
import { ExecOptions } from "./types";

interface CommonExecOptions extends ExecOptions {
  action: keyof typeof COMMON_ACTIONS;
}
const actionFns = {
  scrollToTop,
  scrollToBottom,
  reload,
};

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

function scrollToTop() {
  window.scrollBy(0, -document.body.scrollHeight);
}

function scrollToBottom() {
  window.scrollBy(0, document.body.scrollHeight);
}

function reload() {
  location.reload();
}
