import $ from "jquery";

import { BUILDIN_ACTIONS } from "../common/const";
import { isDark } from "../helper/sun";
import { Base } from "./Base";
import { ActionHelper, ExecOptions } from "./types";

export interface DarkModeOptions extends ExecOptions {
  /**
   * Longitude
   */
  lat?: string;
  /**
   * Latitude
   */
  long?: string;
}

export class DarkMode extends Base<DarkModeOptions> {
  name = BUILDIN_ACTIONS.DARK_MODE;

  private theme = "sh-dm-dark-mode";

  private defaultOptions: DarkModeOptions = {
    lat: "",
    long: "",
  };

  constructor(helper: ActionHelper<Base, DarkModeOptions>) {
    super(helper, {
      shouldRecord: true,
      esc2exit: true,
    });
  }

  private shouldStart(options = this.defaultOptions) {
    const { lat, long } = options;

    if (lat && long) {
      const flag = isDark(parseInt(lat), parseInt(long));

      return flag;
    } else {
      return true;
    }
  }

  execute(elem, options: Partial<DarkModeOptions>) {
    if (!this.shouldStart(options)) {
      return;
    }

    $("html").attr("theme", this.theme);

    this.recordIfNeeded(options);

    this.resetFns.push(() => {
      $("html").attr("theme", "");
    });

    return true;
  }
}
