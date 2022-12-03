import { createContext, useContext } from "react";

import { BUILDIN_ACTIONS } from "@src/common/const";

import { RunAt } from "../../server/enum/Automation.enum";
import { IShortcut } from "@src/server/db/database";

export const ACTIONS = {
  TAB_META: "tabMeta",
  TAB_CHANGE: "tabChange",
  AUTOMATION_FORM_UPDATE: "initAutomationForm",
  AUTOMATION_FORM_CLOSE: "automationFormClose",
  AUTOMATIONS: "AUTOMATIONS",
  SHORTCUT_FORM_UPDATE: "initShortcutForm",
  SHORTCUT_FORM_CLOSE: "shortcutFormClose",
  SHORTCUTS: "SHORTCUTS",
};

export function pageReducer(state: PageState, action) {
  const { type, payload } = action;
  const newState: any = {};

  switch (type) {
    case ACTIONS.TAB_META:
      newState.tab = payload;
      break;
    case ACTIONS.TAB_CHANGE:
      newState.tabKey = payload;
      break;
    case ACTIONS.AUTOMATION_FORM_UPDATE:
      newState.amFormEditing = true;
      newState.automationForm = {
        ...(state.automationForm || {}),
        ...payload,
      };
      break;
    case ACTIONS.AUTOMATION_FORM_CLOSE:
      newState.amFormEditing = false;
      newState.automationForm = getDefaultAutomationForm();
      break;
    case ACTIONS.AUTOMATIONS:
      newState.automations = payload;
      break;
    case ACTIONS.SHORTCUT_FORM_UPDATE:
      newState.scFormEditing = true;
      newState.shortcutForm = {
        ...(state.shortcutForm || {}),
        ...payload,
      };
      break;
    case ACTIONS.SHORTCUT_FORM_CLOSE:
      newState.scFormEditing = false;
      newState.shortcutForm = getDefaultShortcutForm();
      break;
    case ACTIONS.SHORTCUTS:
      newState.shortcuts = payload;
      break;
    default:
      break;
  }
  return {
    ...state,
    ...newState,
  };
}

export const PageContext = createContext(null);

function getDefaultAutomationForm() {
  return {
    instructions: "",
    action: BUILDIN_ACTIONS.READ_MODE,
    args: "",
    scope: "body",
    pattern: "",
    runAt: RunAt.END,
  };
}

function getDefaultShortcutForm() {
  return {
    shortcut: "",
    aid: "",
    wid: "",
    name: "",
    action: "",
  };
}

type PageState = ReturnType<typeof getInitialState>;

export function getInitialState() {
  return {
    tab: null,
    tabKey: "automation",
    automationForm: getDefaultAutomationForm(),
    amFormEditing: false,
    automations: [],
    shortcutForm: getDefaultShortcutForm(),
    scFormEditing: false,
    shortcuts: [] as IShortcut[],
  };
}

export function useModel() {
  return useContext(PageContext);
}
