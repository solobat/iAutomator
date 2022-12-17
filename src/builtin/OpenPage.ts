import { NOTICE_TARGET } from "@src/common/enum";
import { PageType } from "@src/helper/url";
import { BUILDIN_ACTIONS, PAGE_ACTIONS } from "../common/const";
import { Base } from "./Base";
import { ExecOptions } from "./types";

export interface OpenPageExecOptions extends ExecOptions {
  /**
   * url to be opened
   */
  url?: string;

  /**
   * pattern to check exist
   */
  pattern?: string;
  /**
   * type of page
   */
  type?: PageType;

  /**
   * args for page type
   */
  args?: string;
}

export class OpenPage extends Base<OpenPageExecOptions> {
  name = BUILDIN_ACTIONS.OPEN_PAGE;

  private NEW_PAGE_DELAY = 2000;

  execute(_, options: Partial<OpenPageExecOptions>) {
    const { value, type, url, args = "", pattern } = options;
    this.helper.invoke(
      PAGE_ACTIONS.OPEN_PAGE,
      {
        url,
        pattern,
        type,
        args: args ? { ...args.split(",") } : { 0: value },
      },
      (isNewPage: boolean) => {
        this.callNext(options, options);
        setTimeout(
          () => {
            this.broadcast(options, options);
          },
          isNewPage ? this.NEW_PAGE_DELAY : 0
        );
      },
      NOTICE_TARGET.BACKGROUND
    );
    this.recordIfNeeded(options);

    return true;
  }
}
