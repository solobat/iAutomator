import { createContext, useContext } from "react";

import { BUILTIN_ACTIONS } from "@src/common/const";
import { InstructionData } from "@src/helper/instruction";
import { IShortcut } from "@src/server/db/database";

import { RunAt } from "../../server/enum/Automation.enum";

export const ACTIONS = {
  TAB_META: "tabMeta",
  TAB_CHANGE: "tabChange",
  AUTOMATION_FORM_UPDATE: "initAutomationForm",
  AUTOMATION_FORM_UPDATE_INS: "initAutomationFormIns",
  AUTOMATION_FORM_NEW_INS: "automationFormNewIns",
  AUTOMATION_FORM_DEL_INS: "automationFormDelIns",
  AUTOMATION_FORM_CLOSE: "automationFormClose",
  AUTOMATIONS: "AUTOMATIONS",
  SHORTCUT_FORM_UPDATE: "initShortcutForm",
  SHORTCUT_FORM_CLOSE: "shortcutFormClose",
  SHORTCUTS: "SHORTCUTS",
};

export enum AmFormEditing {
  False = 0,
  Instruction,
  Script,
}

export function pageReducer(state: PageState, action) {
  const { type, payload } = action;
  const newState: Partial<PageState> = {};

  switch (type) {
    case ACTIONS.TAB_META:
      newState.tab = payload;
      break;
    case ACTIONS.TAB_CHANGE:
      newState.tabKey = payload;
      break;
    case ACTIONS.AUTOMATION_FORM_UPDATE:
      newState.amFormEditing = action.editingMode ?? AmFormEditing.Instruction;
      newState.automationForm = {
        ...(state.automationForm || {}),
        ...payload,
      };
      break;
    case ACTIONS.AUTOMATION_FORM_NEW_INS:
      newState.automationForm = {
        ...(state.automationForm || ({} as AutomationForm)),
      };
      newState.automationForm.data.splice(payload.index, 0, getDefaultNewIns());
      break;
    case ACTIONS.AUTOMATION_FORM_DEL_INS:
      newState.automationForm = {
        ...(state.automationForm || ({} as AutomationForm)),
      };
      newState.automationForm.data.splice(payload.index, 1);
      if (!newState.automationForm.data.length) {
        newState.automationForm.data.push(getDefaultNewIns());
      }
      break;
    case ACTIONS.AUTOMATION_FORM_UPDATE_INS:
      newState.automationForm = {
        ...(state.automationForm || ({} as AutomationForm)),
      };

      Object.assign(
        newState.automationForm.data[payload.index],
        payload.changes
      );

      break;
    case ACTIONS.AUTOMATION_FORM_CLOSE:
      newState.amFormEditing = AmFormEditing.False;
      newState.automationForm = getDefaultAutomationForm() as AutomationForm;
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

export interface AutomationForm {
  instructions: string;
  data: Omit<InstructionData, "args">[];
  pattern: string;
  scripts: string;
  runAt: RunAt.END;
  id?: number;
}

function getDefaultNewIns() {
  return {
    action: BUILTIN_ACTIONS.READ_MODE,
    rawArgs: "",
    scope: "body",
  };
}

function getDefaultAutomationForm(): AutomationForm {
  return {
    instructions: "",
    data: [getDefaultNewIns()] as Omit<InstructionData, "args">[],
    pattern: "",
    scripts: "",
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

export type PageState = ReturnType<typeof getInitialState>;

export function getInitialState() {
  return {
    tab: null,
    tabKey: "automation",
    automationForm: getDefaultAutomationForm() as AutomationForm,
    amFormEditing: AmFormEditing.False,
    scriptsEditing: false,
    scripts: `
automation for {url} on "load"
    {statements}
end
    `,
    automations: [],
    shortcutForm: getDefaultShortcutForm(),
    scFormEditing: false,
    shortcuts: [] as IShortcut[],
  };
}

export function useModel() {
  return useContext(PageContext);
}
