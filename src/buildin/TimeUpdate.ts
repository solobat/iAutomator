import Base, { DomHelper, ExecOptions } from "./Base";
import { BUILDIN_ACTIONS } from "../common/const";
import throttle from "lodash/throttle";

export default class TimeUpdate extends Base {
  name = BUILDIN_ACTIONS.TIME_UPDATE;

  constructor(helper: DomHelper) {
    super(helper, {
      shouldRecord: true,
      esc2exit: true,
    });
  }

  start() {
    this.exec(document.querySelector("video"), {});
  }

  exec(elem, options?: ExecOptions) {
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

      this.unbindFns.push(() => {
        elem.removeEventListener("timeupdate", onTimeupdate);
      });

      this.recordIfNeeded(options);

      return true;
    } else {
      return false;
    }
  }
}
