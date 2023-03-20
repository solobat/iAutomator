import { GlobalEvents } from "@src/helper/event";
import { BUILTIN_ACTIONS } from "../common/const";
import { Base } from "./Base";
import { ExecOptions } from "./types";

export interface SingleTabExecOptions extends ExecOptions {
  path?: string;
}

export class SingleTab extends Base {
  name = BUILTIN_ACTIONS.SINGLE_TAB;

  listenEvents() {
    this.helper.emitter.on(
      GlobalEvents().nameForReceive("singleTab"),
      (data) => {
        if (data.domain === window.location.host) {
          window.close();
        }
      }
    );
  }

  noticeOthersToClose() {
    this.helper.broadcast.emit("singleTab", {
      domain: window.location.host,
    });
  }

  execute(elem, options: Partial<SingleTabExecOptions>) {
    this.listenEvents();
    this.noticeOthersToClose();
    this.recordIfNeeded(options);

    return true;
  }
}
