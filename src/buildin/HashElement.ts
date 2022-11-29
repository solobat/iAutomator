import $ from "jquery";

import { BUILDIN_ACTIONS } from "../common/const";
import Base from "./Base";
import { ExecOptions } from "./types";

export default class HashElements extends Base {
  name = BUILDIN_ACTIONS.HASH_ELEMENT;
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
