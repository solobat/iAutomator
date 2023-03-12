import { BUILDIN_ACTIONS } from "../common/const";
import { Base } from "./Base";
import { ExecOptions } from "./types";
import "is-in-viewport";
import $ from "jquery";

export interface ReloadPageExecOptions extends ExecOptions {
  interval: number;
  start?: string;
  stop?: string;
}

export class ReloadPage extends Base {
  name = BUILDIN_ACTIONS.RELOAD;

  private elemExist(selector: string) {
    return $(selector).length > 0 && $(selector).is(":in-viewport");
  }

  private shouldStart(start: string) {
    return !start || this.elemExist(start);
  }

  private shouldStop(stop: string) {
    return stop && this.elemExist(stop);
  }

  execute(_, options: Partial<ReloadPageExecOptions>) {
    const interval = Number(options.interval);

    if (
      interval &&
      this.shouldStart(options.start) &&
      !this.shouldStop(options.stop)
    ) {
      setTimeout(() => {
        window.location.reload();
      }, interval * 1000);
      this.recordIfNeeded(options);
    } else {
      setTimeout(() => {
        this.callNext(options, options);
      }, 1000);
    }

    return true;
  }
}
