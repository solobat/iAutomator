import { GlobalEvents } from "@src/helper/event";
import { BUILTIN_ACTIONS } from "../common/const";
import { Base } from "./Base";
import { ExecOptions } from "./types";

export interface SingleTabExecOptions extends ExecOptions {
  path?: string;
  action?: "tab" | "video";
}

export class SingleTab extends Base {
  name = BUILTIN_ACTIONS.SINGLE_TAB;

  listenEvents() {
    this.helper.emitter.on(
      GlobalEvents().nameForReceive("singleTab"),
      (data) => {
        if (data.domain === window.location.host) {
          if (data.action === "tab") {
            this.closeTab();
          } else if (data.action === "video") {
            this.updateVideoStatus("pause");
          }
        }
      }
    );
  }

  private closeTab() {
    window.close();
  }

  private updateVideoStatus(status: "play" | "pause") {
    const video = document.querySelector("video");
    if (video) {
      if (status === "play") {
        video.play();
      } else {
        video.pause();
      }
    }
  }

  private emitSingleTab(action = "tab") {
    this.helper.broadcast.emit("singleTab", {
      domain: window.location.host,
      action,
    });
  }

  private noticeOthersToSingle(action = "tab") {
    this.emitSingleTab(action);

    if (action === "video") {
      this.helper.onRevisible(() => {
        this.emitSingleTab(action);
        this.updateVideoStatus("play");
      });
    }
  }

  execute(elem, options: Partial<SingleTabExecOptions>) {
    this.listenEvents();
    this.noticeOthersToSingle(options.action);

    return true;
  }
}
