import Base, { ExecOptions } from "./Base";
import { BUILDIN_ACTIONS } from "../common/const";
import { NOTICE_TARGET } from "../common/enum";
import $ from "jquery";

export default class HighlightEnglishSyntax extends Base {
  name = BUILDIN_ACTIONS.HIGHLIGHT_ENGLISH_SYNTAX;

  exec(elem, options?: ExecOptions) {
    const $elem = $(elem);

    if ($elem.length) {
      const text = $elem[0].innerText;
      if (text) {
        this.helper.invoke(
          BUILDIN_ACTIONS.HIGHLIGHT_ENGLISH_SYNTAX,
          {
            text,
          },
          (resp) => {
            if (resp) {
              $elem.html(resp);
            }
          },
          NOTICE_TARGET.BACKGROUND
        );
      }

      return true;
    } else {
      return false;
    }
  }
}
