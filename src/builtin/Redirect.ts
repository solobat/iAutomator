import { mergeQuery, QFormat } from "@src/helper/url";
import URLPattern from "url-pattern";

import { BUILTIN_ACTIONS } from "../common/const";
import { Base } from "./Base";
import { ExecOptions } from "./types";

export interface RedirectExecOptions extends ExecOptions {
  /**
   * the hostname of to page
   */
  host?: string;
  /**
   * the path pattern of from page
   */
  from?: string;
  /**
   * the path pattern of to page
   */
  to?: string;

  /**
   * new query(pieces) of url
   */
  query?: string;

  /**
   * format of query
   */
  qformat?: QFormat;
}

export class Redirect extends Base {
  name = BUILTIN_ACTIONS.REDIRECT;

  private redirectToNewURL(
    fromPatternStr: string,
    toPatternStr: string,
    toHost: string
  ) {
    const fromPattern = new URLPattern(fromPatternStr);
    const match = fromPattern.match(location.pathname);

    if (match) {
      const toPattern = new URLPattern(toPatternStr);
      const toPath = toPattern.stringify(match);
      const host = toHost.startsWith("http")
        ? toHost
        : `${window.location.protocol}://${toHost}`;
      const toURL = `${host}${toPath}${window.location.search}`;

      window.location.href = toURL;
    }
  }

  private redirectToNewSearch(
    newQuery: string,
    originQuery: string,
    qformat: QFormat
  ) {
    const newSearch = mergeQuery(newQuery, originQuery, qformat);
    const { protocol, pathname, hostname } = window.location;
    const toURL = `${protocol}//${hostname}${pathname}?${newSearch}`;

    window.location.href = toURL;
  }

  execute(_, options: Partial<RedirectExecOptions>) {
    const {
      from,
      to,
      query,
      qformat = "default",
      host = window.location.hostname,
      value,
    } = options;

    if (from && to) {
      this.redirectToNewURL(from, to, host);
    } else if (query ?? value) {
      this.redirectToNewSearch(query ?? value, window.location.search, qformat);
    }

    return false;
  }
}
