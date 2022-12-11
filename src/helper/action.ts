import getCssSelector from "css-selector-generator";
import keyboardJS from "keyboardjs";

import { ActionHelper, ExecOptions, GlobalEvent } from "@src/builtin/types";
import { IAutomation, IShortcut } from "@src/server/db/database";

import { Base } from "../builtin/Base";
import { PAGE_ACTIONS, REDO_DELAY, ROUTE_CHANGE_TYPE } from "../common/const";
import { RunAt } from "../server/enum/Automation.enum";
import { appBridge } from "./bridge";
import {
  getElem,
  insertCss,
  listenRouteChangeEvents,
  observe,
  onReady,
  setupOutline,
  startOutline,
} from "./dom";
import { GlobalEvents, noticeBg } from "./event";
import { Stack } from "./data";
import { SimpleEvent } from "@src/utils/event";

let isSetup;
const emitter = new SimpleEvent();
let automations: Array<IAutomation> = [];
let shortcuts: IShortcut[] = [];
const globalEvents = GlobalEvents();

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

export function exceAutomation(
  content,
  times = 0,
  runAt: RunAt,
  runtimeOptions: ExecOptions = {}
) {
  const [actionStr, selector] = content.split("@");
  const [action, ...modifiers] = actionStr.split("^");
  const elem = getElem(selector);

  function tryAgain() {
    if (times < 5) {
      const delay = runAt === RunAt.START ? 16 : 1000;

      setTimeout(() => {
        exceAutomation(content, times + 1, runAt, runtimeOptions);
      }, delay);
    }
  }
  function exec(instance: Base) {
    instance.autoMationFn = () => {
      times = 0;
      tryAgain();
    };
    const staticOptions: ExecOptions = getExecOptions(modifiers);
    const options = Object.assign(staticOptions, runtimeOptions, {
      next: staticOptions.next,
    });

    if (instance.options.shouldRedo) {
      instance.reExecute = (type: string) => {
        const delay = getDelayByRouteChangeType(type);

        setTimeout(() => {
          instance.makeExecution(elem, options);
        }, delay);
      };
    }
    instance.makeExecution(elem, options);
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
    exceAutomation: (
      content: string,
      times: number,
      runAt: RunAt,
      options?: ExecOptions
    ) => void;
  }
}

window.exceAutomation = exceAutomation;

export const helper: ActionHelper<Base> = {
  actionCache: {
    $elem: null,
    subActions: null,
  },

  prepare(fn, options) {
    setup(options.withOutline);
    if (options.withOutline) {
      startOutline(fn);
    } else {
      fn(options.defaultScope, null);
    }
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

  activeActions: Stack(),

  observe,

  onRevisible,

  emitter,

  broadcast: {
    init() {
      helper.emitter.on(
        globalEvents.nameForSend(),
        (name: string, data: any) => {
          noticeBg({
            action: PAGE_ACTIONS.GLOABL_EVENT_EMITTED,
            data: {
              action: name,
              payload: data,
            } as GlobalEvent,
          });
        }
      );
    },

    emit(name, data) {
      helper.emitter.emit(globalEvents.nameForSend(), name, data);
    },
  },
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

function setupEsc(cb: () => void, helper: ActionHelper<Base>) {
  keyboardJS.bind("esc", function onEsc() {
    cb();
    helper.resetActionCache();
  });
}

function setupEvents(helper: ActionHelper<Base>) {
  setupRevisible(() => emitter.emit("revisible"));
  setupEsc(() => emitter.emit("exit"), helper);
}

export function install(actionFns: (helper: ActionHelper<Base>) => void) {
  helper.broadcast.init();
  setupEvents(helper);
  actionFns(helper);
}

export function startAction(actionName: string) {
  const action = findAction(actionName);

  if (action) {
    action.startByCommand();
  }
}

function onStateChange(type: string) {
  const actions = helper.actions.filter((item) => item.options.shouldRedo);

  actions.forEach((item) => {
    if (item.reExecute && item.active) {
      item.reExecute(type);
    }
  });
}

function setup(withOutline?: boolean) {
  if (!isSetup) {
    helper.insertCss(getStyles());

    if (withOutline) {
      setupOutline();
    }

    isSetup = true;
  }
}

function findAction(name: string): Base | null {
  return helper.actions.find((item) => item.name === name);
}

function fetchPageDataAndApply() {
  noticeBg(
    {
      action: PAGE_ACTIONS.PAGE_DATA,
      data: { url: window.location.href },
    },
    (result) => {
      automations = result.data.automations;
      shortcuts = result.data.shortcuts;

      initAutomations();
      initShortcuts();
    }
  );
}

function initAutomations() {
  if (automations.length) {
    const activeItems = automations.filter((item) => item.active);
    const immediateItems = activeItems.filter(
      (item) => item.runAt === RunAt.START
    );
    const readyItems = activeItems.filter((item) => item.runAt === RunAt.END);
    const delayedItems = activeItems.filter(
      (item) => item.runAt === RunAt.IDLE
    );

    execAutomations(immediateItems, RunAt.START);

    onReady(() => {
      helper.insertCss(getStyles());
      execAutomations(readyItems, RunAt.END);

      window.setTimeout(() => {
        execAutomations(delayedItems, RunAt.END);
      }, 1000);
    });

    listenRouteChangeEvents(onStateChange);
  }
}

function initShortcuts() {
  shortcuts.map((shortcut) => {
    const onTrigger = (event) => {
      event.preventDefault();
      exceAutomationById(shortcut.aid);
    };
    keyboardJS.bind(shortcut.shortcut, onTrigger);

    return () => {
      keyboardJS.unbind(shortcut.shortcut, onTrigger);
    };
  });
}

function execAutomations(automations, runAt: RunAt) {
  automations.forEach((item) => {
    exceAutomation(item.instructions, 0, runAt);
  });
}

export function exceAutomationById(id: number, options?: ExecOptions) {
  const item = automations.find((a) => a.id === id);

  if (item) {
    exceAutomation(item.instructions, 0, item.runAt, options);
  }
}

fetchPageDataAndApply();

export function exec(fn, withOutline?: boolean) {
  setup(withOutline);
  startOutline(fn);
}

function getStyles() {
  return helper.actions.reduce((memo, item) => {
    if (item.style) {
      memo += item.style;
    }

    return memo;
  }, "");
}

export function receiveGlobalEvent(event: GlobalEvent) {
  const { action, payload } = event;

  helper.emitter.emit(globalEvents.nameForReceive(action), payload);
}
