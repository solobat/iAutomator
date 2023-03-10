import $ from "jquery";

import { BUILDIN_ACTIONS } from "../common/const";
import { Base } from "./Base";
import { ExecOptions } from "./types";

export type RefreshType = "auto" | "manual";

export interface BookmarkExecOptions extends ExecOptions {
  /**
   * CSS-Selector of the target items
   */
  item: string;
  /**
   * Refersh type: auto | manual
   */
  refresh?: RefreshType;
  /**
   * Should notify on the title?
   */
  notify?: boolean;
}

export class Bookmark extends Base<BookmarkExecOptions> {
  name = BUILDIN_ACTIONS.BOOKMARK;
  cls = "ext-hp-bookmark";

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

    this.resetFns.push(unbindFn);
  }

  private setupManualRefresh(item: string) {
    this.$elem?.on("mouseenter", () => {
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
    this.resetFns.push(unbindFn);
  }

  execute(elem, options: Partial<BookmarkExecOptions>) {
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
