import getCssSelector from "css-selector-generator";
import {
  bindKeyCombo,
  unbindKeyCombo,
  bindKey,
  unbindKey,
} from "@rwh/keystrokes";

import {
  ActionHelper,
  ActionRunMode,
  ExecOptions,
  GlobalEvent,
} from "@src/builtin/types";
import { IAutomation, IShortcut } from "@src/server/db/database";
import { SimpleEvent } from "@src/utils/event";
import { show } from "@src/utils/log";

import { Base } from "../builtin/Base";
import { PAGE_ACTIONS, REDO_DELAY, ROUTE_CHANGE_TYPE } from "../common/const";
import { RunAt } from "../server/enum/Automation.enum";
import { appBridge } from "./bridge";
import { Stack } from "./data";
import {
  getElem,
  insertCss,
  listenRouteChangeEvents,
  observe,
  onReady,
  setupOutline,
  startOutline,
} from "./dom";
import { GlobalEvents, isComboKey, noticeBg } from "./event";
import { InstructionData } from "./instruction";
import { parseScript, ScriptAutomation, ScriptInstruction } from "./script";

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

function resolveInstructionArgs(instruction: ScriptInstruction) {
  const { args, env } = instruction;

  for (const key in args) {
    const element = args[key];
    if (typeof element === "function") {
      args[key] = element(env);
    } else if (element == null) {
      args[key] = env.search(key);
    }
  }
}

export function exceScriptAutomation(
  instructions: ScriptInstruction[],
  times = 0,
  runAt: RunAt,
  runtimeOptions: ExecOptions = { index: 0, mode: "single" }
) {
  const instruction = instructions[runtimeOptions.index];

  if (!instruction) {
    show("current is the latest instruction, group is done", runtimeOptions);
    return;
  }
  const scope = instruction.scope ?? "body";
  const elem = getElem(scope);

  instruction.args.scope = scope;

  function tryAgain() {
    if (times < 5) {
      const delay = runAt === RunAt.START ? 16 : 1000;

      setTimeout(() => {
        exceScriptAutomation(instructions, times + 1, runAt, runtimeOptions);
      }, delay);
    }
  }
  function exec(instance: Base) {
    instance.autoMationFn = () => {
      times = 0;
      tryAgain();
    };
    try {
      resolveInstructionArgs(instruction);
    } catch (error) {
      console.log(error);
    }

    const staticOptions: ExecOptions = instruction.args;
    const options = Object.assign(staticOptions, runtimeOptions, {
      silent: true,
      next:
        runtimeOptions.mode === "group"
          ? runtimeOptions.next
          : staticOptions.next,
    });

    if (instance.options.shouldRedo) {
      instance.reExecute = (type: string) => {
        const delay = getDelayByRouteChangeType(type);

        setTimeout(() => {
          instance.makeExecution(elem, options, instruction.effect);
        }, delay);
      };
    }
    instance.makeExecution(elem, options, instruction.effect);
  }

  if (elem) {
    const instance = findAction(instruction.action);

    if (instance) {
      exec(instance);
    }
  } else {
    tryAgain();
  }
}

export function exceAutomation(
  instructions: InstructionData[],
  times = 0,
  runAt: RunAt,
  runtimeOptions: ExecOptions = { index: 0, mode: "single" }
) {
  const instruction = instructions[runtimeOptions.index];

  if (!instruction) {
    show("current is the latest instruction, group is done", runtimeOptions);
    return;
  }

  const elem = getElem(instruction.scope);

  instruction.args.scope = instruction.scope;

  function tryAgain() {
    if (times < 5) {
      const delay = runAt === RunAt.START ? 16 : 1000;

      setTimeout(() => {
        exceAutomation(instructions, times + 1, runAt, runtimeOptions);
      }, delay);
    }
  }
  function exec(instance: Base) {
    instance.autoMationFn = () => {
      times = 0;
      tryAgain();
    };
    const staticOptions: ExecOptions = instruction.args;
    const options = Object.assign(staticOptions, runtimeOptions, {
      silent: true,
      next:
        runtimeOptions.mode === "group"
          ? runtimeOptions.next
          : staticOptions.next,
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
    const instance = findAction(instruction.action);

    if (instance) {
      exec(instance);
    }
  } else {
    tryAgain();
  }
}

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

  redoActions: Stack(),

  discardTab: () => {
    appBridge.invoke(PAGE_ACTIONS.DISCARD_TAB, {}, () => {
      console.log("discard tab");
    });
  },

  observe,

  onRevisible,

  emitter,

  keyboard: {
    bindKeyCombo: bindKeyCombo,
    unbindKeyCombo: unbindKeyCombo,
    bindKey: bindKey,
    unbindKey: unbindKey,
  },

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
  bindKey("Escape", function onEsc(event) {
    if (!event.originalEvent.shiftKey) {
      cb();
      helper.resetActionCache();
    }
  });
}

function setupRedo(cb: () => void, helper: ActionHelper<Base>) {
  bindKey("Escape", function onRedo(event) {
    if (event.originalEvent.shiftKey) {
      cb();
    }
  });
}

function setupEvents(helper: ActionHelper<Base>) {
  setupRevisible(() => emitter.emit("revisible"));
  setupEsc(() => emitter.emit("exit"), helper);
  setupRedo(() => emitter.emit("redo"), helper);
}

export function install(actionFns: (helper: ActionHelper<Base>) => void) {
  helper.broadcast.init();
  setupEvents(helper);
  actionFns(helper);
}

export function mount(item: IAutomation) {
  automations.push(item);
  execAutomationItem(item, -1, item.runAt);
}

export function unmount(item: IAutomation) {
  if (item.instructions) {
    unmountAutomation(item.instructions);
  } else if (item.scripts) {
    unmountAutomationScript(item.scripts);
  }

  automations = automations.filter((a) => a.id !== item.id);
}

function unmountAutomation(instructions: string) {
  const list = parseInstructions(instructions);

  list.forEach((item) => {
    const instance = findAction(item.action);

    if (instance) {
      instance.doExit();
    }
  });
}

function unmountAutomationScript(scripts: string) {
  const [am] = parseScript(scripts);

  am.instructions.forEach((item) => {
    const instance = findAction(item.action);

    if (instance) {
      instance.doExit();
    }
  });
}

export function startAction(actionName: string) {
  const action = findAction(actionName);

  if (action) {
    action.startByCommand();
  }
}

function onStateChange(type: string) {
  helper.activeActions.forEach((item) => {
    item.doExit();
  });
  fetchPageDataAndApply();
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

function sortAutomationByPattern(list: IAutomation[]) {
  return list.sort((a, b) => {
    const aPattern = a.pattern ?? "";
    const bPattern = b.pattern ?? "";

    return bPattern.length - aPattern.length;
  });
}

export function fetchPageDataAndApply() {
  noticeBg(
    {
      action: PAGE_ACTIONS.PAGE_DATA,
      data: { url: window.location.href },
    },
    (result) => {
      automations = sortAutomationByPattern(result.data.automations);
      shortcuts = result.data.shortcuts;

      initAutomations();
      initShortcuts();
    }
  );
}

function categorizeItems(activeItems: IAutomation[]) {
  const { START, END, IDLE } = RunAt;

  return activeItems.reduce(
    (acc, item) => {
      switch (item.runAt) {
        case START:
          acc.immediateItems.push(item);
          break;
        case END:
          acc.readyItems.push(item);
          break;
        case IDLE:
          acc.delayedItems.push(item);
          break;
        default:
          break;
      }
      return acc;
    },
    { immediateItems: [], readyItems: [], delayedItems: [] }
  );
}

function initAutomations() {
  if (automations.length) {
    const activeItems = automations.filter((item) => item.active);
    const { immediateItems, readyItems, delayedItems } =
      categorizeItems(activeItems);

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
    if (isComboKey(shortcut.shortcut)) {
      const onTrigger = ({ finalKeyEvent }) => {
        finalKeyEvent.preventDefault();
        exceAutomationById(shortcut.aid);
      };
      bindKeyCombo(shortcut.shortcut, onTrigger);

      return () => {
        unbindKeyCombo(shortcut.shortcut, onTrigger);
      };
    } else {
      const onTrigger = (event) => {
        event.originalEvent.preventDefault();
        exceAutomationById(shortcut.aid);
      };
      bindKey(shortcut.shortcut, onTrigger);

      return () => {
        unbindKey(shortcut.shortcut, onTrigger);
      };
    }
  });
}

function getMode(instructions: string) {
  const mode: ActionRunMode =
    instructions.split(";").length > 1 ? "group" : "single";

  return mode;
}

function getOptions(
  item: IAutomation,
  options: ExecOptions = { mode: "single", index: 0 }
) {
  const mode = getMode(item.instructions);
  const next = mode === "single" ? options.next : item.id;

  return { ...options, mode, next, index: options.index ?? 0 };
}

function getScriptAutomationOptions(
  item: ScriptAutomation,
  options: ExecOptions = { mode: "single", index: 0 }
) {
  const mode: ActionRunMode = item.instructions.length ? "group" : "single";
  const next = mode === "single" ? options.next : item.id;

  return { ...options, mode, next, index: options.index ?? 0 };
}

function parseInstructions(content: string): InstructionData[] {
  const instructions = content.split(";");

  return instructions.map((instruction) => {
    const [actionStr, selector] = instruction.split("@");
    const [action, ...modifiers] = actionStr.split("^");

    return {
      action,
      args: getExecOptions(modifiers),
      rawArgs: modifiers.join("^"),
      scope: selector,
    };
  });
}

function scriptAutomationId(id: number, index: number) {
  return id * 10000 + index;
}

function execAutomationScripts(
  scripts: string,
  aIndex: number,
  id: number,
  options?: ExecOptions
) {
  try {
    const automations = parseScript(scripts);
    const list = aIndex === -1 ? automations : [automations[aIndex]];

    list.forEach((automation, inaIndex) => {
      const index = aIndex === -1 ? inaIndex : aIndex;
      automation.id = scriptAutomationId(id, index);
      exceScriptAutomation(
        automation.instructions,
        0,
        automation.runAt,
        getScriptAutomationOptions(automation, options)
      );
    });
  } catch (error) {
    console.log("parse error", error);
  }
}

function execAutomations(automations: IAutomation[], runAt: RunAt) {
  automations.forEach((item) => {
    execAutomationItem(item, -1, runAt);
  });
}

function execAutomationItem(
  item: IAutomation,
  aIndex: number,
  runAt: RunAt,
  options?: ExecOptions
) {
  if (item.instructions) {
    exceAutomation(
      parseInstructions(item.instructions),
      0,
      runAt,
      getOptions(item, options)
    );
  } else if (item.scripts) {
    execAutomationScripts(item.scripts, aIndex, item.id, options);
  }
}

function parseAutomationId(id: number) {
  if (id >= 10000) {
    const index = id % 10000;
    const aid = Math.floor(id / 10000);

    return { index, aid };
  } else {
    return { index: 0, aid: id };
  }
}

export function exceAutomationById(id: number, options?: ExecOptions) {
  const { index: aIndex, aid } = parseAutomationId(id);
  const item = automations.find((a) => a.id === aid);

  if (item) {
    execAutomationItem(item, aIndex, item.runAt, options);
  }
}

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
