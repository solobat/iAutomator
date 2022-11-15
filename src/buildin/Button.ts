import Base, { ExecOptions, defaultExecOptions } from "./Base";
import { BUILDIN_ACTIONS } from "../common/const";
import $ from "jquery";

type ButtonType = "top" | "toggle" | "shortcut" | "translate";
type ButtonPosition = "tl" | "tr" | "bl" | "br";

interface ButtonExecOptions extends ExecOptions {
  fixed?: boolean;
  pos?: ButtonPosition;
  type: ButtonType;
}

function formatTrans(raw: Array<Array<Array<string>>>) {
  const trans = raw[0];

  return trans.map((p) => p[0]).join("");
}

function translate(text: string, target: string) {
  return fetch(
    `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${target}&dt=t&q=${encodeURIComponent(
      text
    )}`
  )
    .then((response) => response.json())
    .then(formatTrans);
}

export default class Button extends Base {
  name = BUILDIN_ACTIONS.BUTTON;
  declare cls: "ext-hp-btn";

  shouldRedo = false;

  shouldRecord = true;

  private targetLang = chrome.i18n.getUILanguage();

  start() {
    return;
  }

  checkExecResult(elem, options?: ButtonExecOptions) {
    this.autoMationFn();
  }

  private createBtn(name: string, icon: string) {
    return $(
      `<div class="ext-hp-btn ext-hp-btn-${name}"><i class="iconfont ${icon}" /></div>`
    );
  }

  private insertTopButton(elem, options: ButtonExecOptions) {
    const $top = this.createBtn("top", "icon-direction-up");

    $top.on("click", () => {
      document.body.scrollIntoView({
        behavior: "smooth",
      });
    });

    $("body").append($top);
  }

  private insertToggleButton(scope: HTMLDocument, options: ButtonExecOptions) {
    let nextPageEl: any;
    const { mh = 40 } = options;

    const insertButton = (el: any, next: any, isFirst: boolean) => {
      const $toggle = this.createBtn("toggle", "icon-direction-down-circle");

      let [cur, reset] = [
        { height: `${mh}px`, overflow: "hidden" },
        { height: "auto", overflow: "auto" },
      ];

      $toggle.on("click", () => {
        $toggle.parent().css(cur);

        if (cur.height !== "auto") {
          if (next) {
            next.scrollIntoView();
          } else if (nextPageEl) {
            nextPageEl.scrollIntoView();
            nextPageEl = null;
          }
        }
        [cur, reset] = [reset, cur];
      });

      $(el).addClass("ext-hp-toggled").prepend($toggle);

      if (isFirst) {
        nextPageEl = el;
      }
    };

    function run() {
      const $elems = $(scope).find(options.item).not(".ext-hp-toggled");

      $elems.each((index, elem) => {
        insertButton(elem, $elems[index + 1], index === 0);
      });
    }

    this.helper.observe(scope, run);
  }

  private insertShortcut(elem: HTMLDivElement, options: ButtonExecOptions) {
    const { icon = "icon-link", pos = "cr" } = options;
    const $icon = this.createBtn("link", icon).addClass(pos);

    $icon.on("click", () => {
      elem.click();
    });

    $("body").append($icon);
  }

  private insertTranslate(scope: HTMLDivElement, options: ButtonExecOptions) {
    const { icon = "icon-g-translate", pos = "cr" } = options;
    const iconCls = "ext-hp-translate";
    const translatedCls = "ext-hp-translated";

    const insertButton = (el: HTMLElement) => {
      const $translate = this.createBtn("g-translate", icon).addClass(pos);

      $translate.on("click", ".iconfont", (event) => {
        event.stopPropagation();
        event.preventDefault();
        if ($translate.hasClass(translatedCls)) {
          return false;
        }
        const text = $translate.parent().text();
        translate(text, this.targetLang).then((trans) => {
          $translate
            .addClass(translatedCls)
            .after(`<div class="ext-hp-trans-result">${trans}</div>`);
        });

        return false;
      });
      $(el).addClass(iconCls).append($translate);
    };

    function run() {
      const $elems = $(scope)
        .find<HTMLElement>(options.item)
        .not(`.${iconCls}`);

      $elems.each((index, elem) => {
        insertButton(elem);
      });
    }

    this.helper.observe(scope, run);
  }

  exec(elem, options: ButtonExecOptions) {
    const { type } = options;
    if (type === "top") {
      this.insertTopButton(elem, options);
    } else if (type === "toggle") {
      this.insertToggleButton(elem, options);
    } else if (type === "shortcut") {
      this.insertShortcut(elem, options);
    } else if (type === "translate") {
      this.insertTranslate(elem, options);
    }

    return false;
  }
}
