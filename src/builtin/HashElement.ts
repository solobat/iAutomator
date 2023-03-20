import $ from "jquery";

import { BUILTIN_ACTIONS } from "../common/const";
import { Base } from "./Base";
import { ExecOptions } from "./types";

export class HashElement extends Base {
  name = BUILTIN_ACTIONS.HASH_ELEMENT;
  cls = "ext-hp-hashed";
  style = `
  `;

  private shouldHashedTags = ["h1", "h2", "h3", "h4", "h5", "h6"];

  execute(elem, options: Partial<ExecOptions>) {
    $(this.shouldHashedTags.join(","))
      .filter(`[id]:not(.${this.cls})`)
      .on("click", function () {
        location.hash = this.getAttribute("id");
      })
      .addClass(this.cls);

    this.recordIfNeeded(options);

    return true;
  }
}
