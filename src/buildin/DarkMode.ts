import Base, { ExecOptions, defaultExecOptions, DomHelper } from "./Base";
import { BUILDIN_ACTIONS } from "../common/const";
import keyboardJS from "keyboardjs";
import { isDark } from "../helper/sun";
import $ from "jquery";

interface DarkModeOptions extends ExecOptions {
  lat?: string;
  long?: string;
}

export default class DarkMode extends Base {
  name = BUILDIN_ACTIONS.DARK_MODE;
  shouldRecord = true;

  private theme = "sh-dm-dark-mode";

  private defaultOptions: DarkModeOptions = {
    lat: "",
    long: "",
  };

  constructor(helper: DomHelper) {
    super(helper, {
      shouldRecord: true,
      esc2exit: true,
    });
  }

  start() {
    this.exec(document.body, {});
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

  exec(elem, options?: DarkModeOptions) {
    if (!this.shouldStart(options)) {
      return;
    }

    $("html").attr("theme", this.theme);

    this.recordIfNeeded(options);

    this.unbindFns.push(() => {
      $("html").attr("theme", "");
    });

    return true;
  }
}
