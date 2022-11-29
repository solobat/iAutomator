import Base, { ExecOptions } from "./Base";
import { BUILDIN_ACTIONS } from "../common/const";
import $ from "jquery";

export default class HashElements extends Base {
  name = BUILDIN_ACTIONS.HASH_ELEMENT;
  cls = "ext-hp-hashed";
  style = `
  `;
  shouldRedo = true;
  shouldRecord = true;

  private shouldHashedTags = ["h1", "h2", "h3", "h4", "h5", "h6"];

  startByCommand() {
    this.execute(document.body, {});
  }

  execute(elem, options?: ExecOptions) {
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
