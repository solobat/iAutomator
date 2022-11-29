import Base, { ExecOptions } from "./Base";
import { BUILDIN_ACTIONS } from "../common/const";
import $ from "jquery";

type RefreshType = "auto" | "manual";

interface BookmarkExecOptions extends ExecOptions {
  item: string;
  refresh?: RefreshType;
  notify?: boolean;
}

export default class Bookmark extends Base<BookmarkExecOptions> {
  name = BUILDIN_ACTIONS.BOOKMARK;
  cls = "ext-hp-bookmark";

  shouldRedo = false;

  shouldRecord = true;

  private $elem: JQuery<HTMLElement>;
  private rawTitle = "";
  private autoRefreshTimer = 0;
  private autoRefreshDelay = 3000;

  private getTarget(item: string) {
    return $(item).first();
  }

  private addBookmarkClass($elem: JQuery) {
    $elem.addClass(this.cls);
  }

  private createBookmark($elem: JQuery) {
    this.clearBookmark();
    this.resetTitle();
    if ($elem.length) {
      this.$elem = $elem;
      this.addBookmarkClass($elem);
    }
  }

  private createBookmarkByArg(item: string) {
    const $elem = this.getTarget(item);
    this.createBookmark($elem);
  }

  private clearBookmark() {
    if (this.$elem) {
      this.$elem.removeClass(this.cls);
      this.$elem.off("mouseenter");
    }
  }

  private autoRefresh(item: string) {
    const unbindFn = this.helper.onRevisible(() => {
      clearTimeout(this.autoRefreshTimer);
      this.autoRefreshTimer = window.setTimeout(() => {
        this.createBookmarkByArg(item);
      }, this.autoRefreshDelay);
    });

    this.unbindFns.push(unbindFn);
  }

  private setupManualRefresh(item: string) {
    this.$elem.on("mouseenter", () => {
      this.createBookmarkByArg(item);
      this.setupManualRefresh(item);
    });
  }

  private getUnreadCount() {
    return this.$elem.index();
  }

  private resetTitle() {
    if (this.ready) {
      document.title = this.rawTitle;
    }
  }

  private initNotification(scope: HTMLElement) {
    this.rawTitle = document.title;

    this.helper.observe(scope, () => {
      const count = this.getUnreadCount();

      if (count > 0) {
        document.title = `${count} | ${this.rawTitle}`;
      } else {
        this.resetTitle();
      }
    });
  }

  private setupScroll() {
    const unbindFn = this.helper.onRevisible(() => {
      this.$elem[0].scrollIntoView();
    });
    this.unbindFns.push(unbindFn);
  }

  exec(elem, options: BookmarkExecOptions) {
    const { item, refresh = "manual", notify = true } = options;

    if (item) {
      this.createBookmarkByArg(item);
      if (refresh === "auto") {
        this.autoRefresh(item);
      } else {
        this.setupManualRefresh(item);
      }
      if (notify) {
        this.initNotification(elem);
      }
      this.setupScroll();
    } else {
      return false;
    }

    return false;
  }
}
