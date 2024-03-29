import "is-in-viewport";

import $ from "jquery";

import { BUILTIN_ACTIONS } from "../common/const";
import { Base } from "./Base";
import { ExecOptions } from "./types";

interface OutlineNode {
  name: string;
  level: number;
  index?: number;
  parent: OutlineNode | null;
  children: OutlineNode[];
}

export class Outline extends Base {
  name = BUILTIN_ACTIONS.OUTLINE;
  cls = "ext-hp-outline";
  style = ``;

  private headerElems = [];

  private getParent(node: OutlineNode, level: number) {
    let pNode = node;

    while (pNode.parent) {
      if (pNode.level < level) {
        return pNode;
      } else {
        pNode = pNode.parent;
      }
    }

    return pNode;
  }

  private generateOutline(outlineScope) {
    const headerSels = "h1,h2,h3,h4,h5,h6";

    const nodes = $.makeArray($(outlineScope).find(headerSels)) || [];
    const inViewPortIndexes = [];

    let parent: OutlineNode = {
      name: "root",
      parent: null,
      children: [],
      level: 0,
    };
    const root = parent;

    this.headerElems = nodes.filter((elem) => {
      return elem.innerText !== "";
    });

    this.headerElems.forEach((elem, index) => {
      const level = Number(elem.tagName[1]);

      if ($(elem).is(":in-viewport")) {
        inViewPortIndexes.push(index);
      }

      const item = {
        name: elem.innerText,
        level,
        index: index,
        parent: null,
        children: [],
      };
      const newParent = this.getParent(parent, level);
      item.parent = newParent;
      newParent.children.push(item);
      parent = item;
    });

    if (inViewPortIndexes.length) {
      // items[inViewPortIndexes.pop()].isCurrent = true;
    }

    return root;
  }

  private renderOutline(node: OutlineNode, options?: Partial<ExecOptions>) {
    if (node.name === "root") {
      const children = node.children.map((child) => this.renderOutline(child));
      const pos = options.pos || "tr";

      return `
<div id="${this.cls}" class="${pos}">
  ${pos.startsWith("t") ? `<div class="${this.cls}-fold">-</div>` : ""}
  <div class="content">
  ${children.length ? `<ul>${children.join("")}</ul>` : ""}
  </div>
  ${pos.startsWith("b") ? `<div class="${this.cls}-fold">-</div>` : ""}
</div>
      `;
    } else {
      const children = node.children.map((child) => this.renderOutline(child));

      return `
<li>
  <a href="javascript:;" class="ext-hp-link" data-index="${node.index}">${
        node.name
      }</a>
  ${children.length ? `<ul>${children.join("")}</ul>` : ""}
</li>
      `;
    }
  }

  private createOutlineBtn(scope: string, options: Partial<ExecOptions>) {
    const pos = options.pos || "tr";
    const html = `
<div id="${this.cls}" class="${pos}">
  <div class="${this.cls}-fold-btn">+</div>
</div>
`;
    const $html = $(html);
    $("body").append($html);
    const handler = () => {
      $html.remove();
      this.createOutline(scope, options);
    };
    $("body").on("click", ".ext-hp-outline-fold-btn", handler);
    this.registerUnload(() => {
      $html.remove();
      $("body").off("click", ".ext-hp-outline-fold-btn", handler);
    });
  }

  private toggle() {
    const $fold = $(".ext-hp-outline-fold");

    $fold.html($fold.text() === "-" ? "+" : "-");
    $("#ext-hp-outline .content > ul").toggle();
  }

  private createOutline(scope: string, options: Partial<ExecOptions>) {
    const elems = this.generateOutline(scope);
    const outline = this.renderOutline(elems, options);

    $("body").append($(outline));
    const itemHandler = (elem) => {
      const index = $(elem.target).attr("data-index");

      this.headerElems[Number(index)].scrollIntoView();
      if (options.autoHide) {
        this.toggle();
      }
    };
    $("body").on("click", "#ext-hp-outline a", itemHandler);
    const togglerHandler = () => {
      this.toggle();
    };
    $("body").on("click", ".ext-hp-outline-fold", togglerHandler);
    this.registerUnload(() => {
      $("body").off("click", "#ext-hp-outline a", itemHandler);
      $("body").off("click", "#ext-hp-outline-fold a", togglerHandler);
      $(outline).remove();
      $("#ext-hp-outline").remove();
    });
  }

  execute(elem, options: Partial<ExecOptions>) {
    if (!options.lazy) {
      this.createOutline(elem, options);
    } else {
      this.createOutlineBtn(elem, options);
    }

    return true;
  }
}
