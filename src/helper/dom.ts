import $ from "jquery";
import keyboardJS from "keyboardjs";
import getCssSelector from "css-selector-generator";
import { noticeBg } from "./event";
import { PAGE_ACTIONS, REDO_DELAY, ROUTE_CHANGE_TYPE } from "../common/const";
import Base, { DomHelper, ExecOptions } from "../buildin/Base";
import { appBridge } from "./bridge";
import mitt from "mitt";

import { RunAt } from "../server/enum/Automation.enum";
import { IAutomation } from "@src/server/db/database";

let isSetup, stop, cssInserted;
let automations: Array<IAutomation> = [];

const outlineCls = "ext-hp-ms-over";
const startOutlineEvt = "ext-hp-startoutline";
const stopOutlineEvt = "ext-hp-clearoutline";
const emitter = mitt();

function insertCss() {
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
      ${getStyles()}
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
    keyboardJS.bind("up");
  }

  keyboardJS.bind("up", (event) => {
    event.preventDefault();
    const $p = $(`.${outlineCls}`).parent();

    if ($p.length) {
      $(`.${outlineCls}`).removeClass(outlineCls);
      $p.addClass(outlineCls);
    }
  });

  return stop;
}

function recordAction(actionName, elem?: HTMLElement, options?: ExecOptions) {
  const action = getAction(actionName, elem, options);

  appBridge.invoke(
    PAGE_ACTIONS.RECORD,
    {
      content: action,
      url: window.location.href,
      domain: window.location.host,
    },
    (resp) => {
      console.log(resp);
    }
  );
}

function clear() {
  $(`.${outlineCls}`).removeClass(outlineCls);
}

let outlinedCallback;
function startOutline(callback) {
  outlinedCallback = callback;
  stop && stop();
  stop = start();
}

function stopOutline() {
  outlinedCallback = null;
  stop && stop();
  clear();
}

function setup() {
  if (!isSetup) {
    helper.insertCss();

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

    keyboardJS.bind("esc", () => {
      stopOutline();
    });

    isSetup = true;
  }
}

export function exec(fn) {
  setup();
  startOutline(fn);
}

function serializeOptions(options?: ExecOptions): string {
  if (options) {
    const str = Object.keys(options)
      .map((key) => {
        const val = options[key];

        if (val) {
          return [key, options[key]].join("!");
        } else {
          return "";
        }
      })
      .join("^");

    return str ? `^${str}` : "";
  } else {
    return "";
  }
}

function getAction(
  actionName: string,
  elem?: HTMLElement,
  options?: ExecOptions
) {
  const optStr = serializeOptions(options);

  if (elem) {
    const selector = getCssSelector(elem, { blacklist: [/ext-hp/] });

    return `${actionName}${optStr}@${selector}`;
  } else {
    return `${actionName}${optStr}@body`;
  }
}

window.addEventListener("message", (event) => {
  const { callbackId } = event.data;

  if (callbackId) {
    appBridge.receiveMessage(event.data);
  }
});

function getExecOptions(modifiers = []) {
  const options = {
    silent: true,
  };

  modifiers.forEach((item) => {
    const [key, ...value] = item.split("!");
    if (value.length) {
      if (value.length === 1) {
        try {
          options[key] = JSON.parse(value[0]);
        } catch (error) {
          options[key] = value[0];
        }
      } else {
        options[key] = value;
      }
    } else {
      options[key] = true;
    }
  });

  return options;
}

function getDelayByRouteChangeType(type: string): number {
  if (type === ROUTE_CHANGE_TYPE.POP_STATE) {
    return 1000;
  } else {
    return REDO_DELAY;
  }
}

function getElem(selector: string) {
  if (selector.startsWith("!")) {
    return document.querySelectorAll(selector.substr(1));
  } else {
    return document.querySelector(selector);
  }
}
export function exceAutomation(content, times = 0, runAt: RunAt) {
  const [actionStr, selector] = content.split("@");
  const [action, ...modifiers] = actionStr.split("^");
  const elem = getElem(selector);

  function tryAgain() {
    if (times < 5) {
      const delay = runAt === RunAt.START ? 16 : 1000;

      setTimeout(() => {
        exceAutomation(content, times + 1, runAt);
      }, delay);
    }
  }
  function exec(instance: Base) {
    instance.autoMationFn = () => {
      times = 0;
      tryAgain();
    };
    const options = getExecOptions(modifiers);

    if (instance.shouldRedo) {
      instance.reExecute = (type: string) => {
        const delay = getDelayByRouteChangeType(type);

        setTimeout(() => {
          instance.makeExecution(elem, options);
        }, delay);
      };
    }
    instance.makeExecution(elem, options);
    instance.active = true;
  }

  if (elem) {
    const instance = findAction(action);

    if (instance) {
      exec(instance);
    }
  } else {
    tryAgain();
  }
}

declare global {
  interface Window {
    exceAutomation: (content: string, times: number, runAt: RunAt) => void;
  }
}

window.exceAutomation = exceAutomation;

function observe(elem, cb: () => void) {
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

const helper: DomHelper = {
  actionCache: {
    $elem: null,
    subActions: null,
  },

  exec(fn) {
    setup();
    startOutline(fn);
  },

  resetActionCache() {
    helper.actionCache = {
      $elem: null,
      subActions: null,
    };
  },

  recordAction,

  insertCss,

  invoke: appBridge.invoke,

  actions: [],

  observe,

  onRevisible,

  emitter,
};

function onRevisible(fn: () => void) {
  emitter.on("revisible", fn);

  return () => emitter.off("revisible", fn);
}

function setupRevisible(cb: () => void) {
  let hidden = true;

  const onChange = () => {
    const newHidden = document.hidden;
    if (hidden && !newHidden) {
      cb();
    }
    hidden = newHidden;
    helper.emitter.emit("visibilitychange", newHidden);
  };
  document.addEventListener("visibilitychange", onChange);
}

function setupEsc(cb: () => void, helper: DomHelper) {
  keyboardJS.bind("esc", function onEsc() {
    cb();
    helper.resetActionCache();
  });
}

function setupEvents(helper: DomHelper) {
  setupRevisible(() => emitter.emit("revisible"));
  setupEsc(() => emitter.emit("exit"), helper);
}

export function install(actionFns: (helper: DomHelper) => void) {
  setupEvents(helper);
  actionFns(helper);
}

function findAction(name: string): Base | null {
  return helper.actions.find((item) => item.name === name);
}

function getStyles() {
  return helper.actions.reduce((memo, item) => {
    if (item.style) {
      memo += item.style;
    }

    return memo;
  }, "");
}

export function startAction(actionName: string) {
  const action = findAction(actionName);

  if (action) {
    action.startByCommand();
  }
}

function onStateChange(type: string) {
  const actions = helper.actions.filter((item) => item.shouldRedo);

  actions.forEach((item) => {
    if (item.reExecute && item.active) {
      item.reExecute(type);
    }
  });
}

function listenEventsAndRedoActions() {
  const pushState = window.history.pushState;

  window.history.pushState = function (...args) {
    pushState.call(window.history, ...args);
    onStateChange(ROUTE_CHANGE_TYPE.PUSH_STATE);
  };

  $(document).on("click", "a", function () {
    const $a = $(this);

    if (!$a.attr("href").startsWith("http") && !$a.hasClass("ext-hp-link")) {
      onStateChange(ROUTE_CHANGE_TYPE.LINK);
    }
  });
  window.addEventListener("popstate", () => {
    onStateChange(ROUTE_CHANGE_TYPE.POP_STATE);
  });
}

function fetchAndRunAutomations() {
  noticeBg(
    {
      action: PAGE_ACTIONS.AUTOMATIONS,
      data: { url: window.location.href },
    },
    (result) => {
      if (result.data && result.data.length) {
        automations = result.data;
        const activeItems = result.data.filter((item) => item.active);
        const immediateItems = activeItems.filter(
          (item) => item.runAt === RunAt.START
        );
        const readyItems = activeItems.filter(
          (item) => item.runAt === RunAt.END
        );
        const delayedItems = activeItems.filter(
          (item) => item.runAt === RunAt.IDLE
        );

        execAutomations(immediateItems, RunAt.START);

        $(() => {
          helper.insertCss();
          execAutomations(readyItems, RunAt.END);

          window.setTimeout(() => {
            execAutomations(delayedItems, RunAt.END);
          }, 1000);
        });

        listenEventsAndRedoActions();
      }
    }
  );
}

function execAutomations(automations, runAt: RunAt) {
  automations.forEach((item) => {
    exceAutomation(item.instructions, 0, runAt);
  });
}

export function exceAutomationById(id: number) {
  const item = automations.find((a) => a.id === id);

  if (item) {
    exceAutomation(item.instructions, 0, item.runAt);
  }
}

fetchAndRunAutomations();
