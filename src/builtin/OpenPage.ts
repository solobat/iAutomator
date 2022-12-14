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

  execute(_, options: Partial<OpenPageExecOptions>) {
    const { value, type, url, args = "" } = options;
    this.helper.invoke(
      PAGE_ACTIONS.OPEN_PAGE,
      {
        url,
        type,
        args: args ? { ...args.split(",") } : { 0: value },
      },
      () => {
        this.callNext(options, options);
      },
      NOTICE_TARGET.BACKGROUND
    );
    this.recordIfNeeded(options);

    return true;
  }
}
