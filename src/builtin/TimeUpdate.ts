import throttle from "lodash/throttle";

import { BUILTIN_ACTIONS } from "../common/const";
import { Base } from "./Base";
import { ActionHelper, ExecOptions } from "./types";

export class TimeUpdate extends Base {
  name = BUILTIN_ACTIONS.TIME_UPDATE;

  constructor(helper: ActionHelper<Base>) {
    super(helper, {
      shouldRecord: true,
      esc2exit: true,
      defaultScope: document.querySelector("video"),
    });
  }

  execute(elem, options: Partial<ExecOptions>) {
    // https://github.com/lodash/lodash/issues/3192#issuecomment-411963038
    const updateURL = throttle((currentTime) => {
      const uo = new URLSearchParams(window.location.search);

      uo.set("t", `${Math.round(currentTime)}s`);
      window.history.replaceState(null, "", `?${uo.toString()}`);
    }, 1000);

    function onTimeupdate(event) {
      updateURL(event.target.currentTime);
    }

    if (elem) {
      elem.addEventListener("timeupdate", onTimeupdate, false);

      this.registerUnload(() => {
        elem.removeEventListener("timeupdate", onTimeupdate);
      });

      return true;
    } else {
      this.recordable = false;
      return false;
    }
  }
}
