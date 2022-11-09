import Base, { ExecOptions } from "./Base";
import { BUILDIN_ACTIONS } from "../common/const";

export default class ProtectPage extends Base {
  name = BUILDIN_ACTIONS.PROTECT;
  shouldRecord = true;

  start() {
    this.exec(document.body, {});
  }

  exec(elem, options?: ExecOptions) {
    window.onbeforeunload = function () {
      return "This page has been protect by yourself";
    };
    this.recordIfNeeded(options);

    return true;
  }
}
