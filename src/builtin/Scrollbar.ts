import { BUILDIN_ACTIONS } from "../common/const";
import { Base } from "./Base";
import { ExecOptions } from "./types";

export interface ScrollbarExecOptions extends ExecOptions {
  /**
   * how long to delay before scrolling(unit s)
   */
  delay?: number;
}
const SCROLLY_KEY = "ex-hp-scrolly";
const SCROLL_PAGE_URL_KEY = "ex-hp-scroll-pageurl";

export class ScrollbarPosition extends Base<ScrollbarExecOptions> {
  name = BUILDIN_ACTIONS.SCROLLBAR;

  private makeScrolling(options: Partial<ScrollbarExecOptions>) {
    const { delay = 0 } = options;
    const latestURL = window.localStorage.getItem(SCROLL_PAGE_URL_KEY);

    if (latestURL === window.location.href) {
      const scrolly = Number(window.localStorage.getItem(SCROLLY_KEY) ?? 0);

      if (scrolly) {
        setTimeout(() => {
          window.scrollTo({
            top: scrolly,
          });
          setTimeout(() => {
            this.callNext(options, options);
          }, 100);
        }, delay * 1000);
      } else {
        this.callNext(options, options);
      }
    } else {
      this.callNext(options, options);
    }
  }

  private storeScrolly() {
    window.onbeforeunload = function () {
      window.localStorage.setItem(SCROLL_PAGE_URL_KEY, window.location.href);
      window.localStorage.setItem(SCROLLY_KEY, String(window.scrollY));
    };
  }

  execute(_, options: Partial<ScrollbarExecOptions>) {
    this.makeScrolling(options);
    this.storeScrolly();

    return true;
  }
}
