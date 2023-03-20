import $ from "jquery";

import { BUILTIN_ACTIONS } from "../common/const";
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
  /**
   * follow the theme of the system
   */
  system?: boolean;
}

export class DarkMode extends Base<DarkModeOptions> {
  name = BUILTIN_ACTIONS.DARK_MODE;

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

  private checkThemeDark(options = this.defaultOptions) {
    const { lat, long, system } = options;

    if (system) {
      return this.getPreferredColorScheme() === "dark";
    } else if (lat && long) {
      const flag = isDark(parseInt(lat), parseInt(long));

      return flag;
    } else {
      return true;
    }
  }

  private getPreferredColorScheme() {
    if (window.matchMedia) {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        return "dark";
      } else {
        return "light";
      }
    }
    return "light";
  }

  execute(_, options: Partial<DarkModeOptions>) {
    const isDark = this.checkThemeDark(options);

    if (!isDark) {
      $("html").attr("theme", "");
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
