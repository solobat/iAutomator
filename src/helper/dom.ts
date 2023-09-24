import $ from "jquery";

import { ROUTE_CHANGE_TYPE } from "../common/const";
import { unbindKey, bindKey } from "@rwh/keystrokes";

let stop, cssInserted;

const outlineCls = "ext-hp-ms-over";
const startOutlineEvt = "ext-hp-startoutline";
const stopOutlineEvt = "ext-hp-clearoutline";

export function insertCss(styles: string) {
  if (!cssInserted) {
    const css = document.createElement("style");

    css.innerHTML = `
    @font-face {
      font-family: 'iconfont';  /* Project id 2357955 */
      src: url('//at.alicdn.com/t/c/font_2357955_72hfzzis2a4.woff2?t=1668058779549') format('woff2'),
           url('//at.alicdn.com/t/c/font_2357955_72hfzzis2a4.woff?t=1668058779549') format('woff'),
           url('//at.alicdn.com/t/c/font_2357955_72hfzzis2a4.ttf?t=1668058779549') format('truetype');
    }
      .${outlineCls} {outline: 2px dotted #ccc!important;}
      ${styles}
    `;
    document.body.appendChild(css);
    cssInserted = true;
  }
}

function start() {
  function listenMouseout(event) {
    $(event.target).removeClass(outlineCls);
  }
  $(document).on("mouseout", listenMouseout);

  function listenMouseover(event) {
    $(event.target).addClass(outlineCls);
  }

  $(document).on("mouseover", listenMouseover);

  function stop() {
    $(document).off("mouseover", listenMouseover);
    $(document).off("mouseout", listenMouseout);
    unbindKey("ArrowUp");
  }

  bindKey("ArrowUp", (event) => {
    event.preventDefault();
    event.originalEvent.preventDefault();
    event.originalEvent.stopPropagation();
    const $p = $(`.${outlineCls}`).parent();

    if ($p.length) {
      $(`.${outlineCls}`).removeClass(outlineCls);
      $p.addClass(outlineCls);
    }
  });

  return stop;
}

function clear() {
  $(`.${outlineCls}`).removeClass(outlineCls);
}

let outlinedCallback;

export function startOutline(callback) {
  outlinedCallback = callback;
  stop && stop();
  stop = start();
}

export function stopOutline() {
  outlinedCallback = null;
  stop && stop();
  clear();
}

export function setupOutline() {
  $(document).on(startOutlineEvt, startOutline);
  $(document).on(stopOutlineEvt, stopOutline);

  document.addEventListener(
    "click",
    function (event) {
      const $target = $(event.target).closest(`.${outlineCls}`);

      if ($target.length) {
        event.stopPropagation();
        event.preventDefault();
        if (outlinedCallback) {
          const keep = outlinedCallback($target[0], event);

          if (!keep) {
            stopOutline();
          }
        } else {
          stopOutline();
        }

        return false;
      }
    },
    true
  );

  bindKey("Escape", () => {
    stopOutline();
  });
}

export function getElem(selector: string) {
  if (selector.startsWith("!")) {
    return document.querySelectorAll(selector.substring(1));
  } else {
    return document.querySelector(selector);
  }
}

export function observe(elem, cb: () => void) {
  const config = { childList: true, subtree: true };
  const callback: MutationCallback = () => {
    const done = () => {
      cb();
    };
    done();
  };

  const observer = new MutationObserver(callback);

  observer.observe(elem, config);
}

export function listenRouteChangeEvents(onChange: (type: string) => void) {
  const pushState = window.history.pushState;

  window.history.pushState = function (...args) {
    pushState.call(window.history, ...args);
    onChange(ROUTE_CHANGE_TYPE.PUSH_STATE);
  };

  $(document).on("click", "a", function () {
    const $a = $(this);
    const href = $a.attr("href");

    if (!href?.startsWith("http") && !$a.hasClass("ext-hp-link")) {
      onChange(ROUTE_CHANGE_TYPE.LINK);
    }
  });
  window.addEventListener("popstate", () => {
    onChange(ROUTE_CHANGE_TYPE.POP_STATE);
  });
}

export function onReady(fn: () => void) {
  $(fn);
}
