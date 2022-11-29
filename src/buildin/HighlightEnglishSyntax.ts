import $ from "jquery";

import { BUILDIN_ACTIONS } from "../common/const";
import { NOTICE_TARGET } from "../common/enum";
import Base from "./Base";
import { ActionHelper } from "./types";

export default class HighlightEnglishSyntax extends Base {
  name = BUILDIN_ACTIONS.HIGHLIGHT_ENGLISH_SYNTAX;

  constructor(helper: ActionHelper<Base>) {
    super(helper, {
      withOutline: true,
    });
  }

  execute(elem) {
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
