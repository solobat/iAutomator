import URLPattern from "url-pattern";

import { BUILDIN_ACTIONS } from "../common/const";
import Base from "./Base";
import { ExecOptions } from "./types";

interface RedirectExecOptions extends ExecOptions {
  host?: string;
  from: string;
  to: string;
}

export default class Redirect extends Base {
  name = BUILDIN_ACTIONS.REDIRECT;

  private redirectTo(
    fromPatternStr: string,
    toPatternStr: string,
    toHost: string
  ) {
    const fromPattern = new URLPattern(fromPatternStr);
    const match = fromPattern.match(location.pathname);

    if (match) {
      const toPattern = new URLPattern(toPatternStr);
      const toPath = toPattern.stringify(match);
      const toURL = `${window.location.protocol}//${toHost}${toPath}`;

      window.location.href = toURL;
    }
  }

  execute(_, options: Partial<RedirectExecOptions>) {
    const { from, to, host = window.location.hostname } = options;

    if (from && to) {
      this.redirectTo(from, to, host);
    }

    return false;
  }
}
