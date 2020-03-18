import { createContext } from 'react';

export const ACTIONS = {
  TAB_META: 'tabMeta',
  TAB_CHANGE: 'tabChange',
  AUTOMATION_FORM_UPDATE: 'initAutomationForm',
  AUTOMATION_FORM_CLOSE: 'automationFormClose'
}

export function pageReducer(state, action) {
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
        ...payload
      };
      break;
    case ACTIONS.AUTOMATION_FORM_CLOSE:
      newState.amFormEditing = false;
      newState.automationForm = null;
      break;
    default:
      break;
  }
  return {
    ...state,
    ...newState
  }
}

export const PageContext = createContext(null)

export function getInitialState() {
  return {
    tab: null,
    tabKey: 'automation',
    automationForm: null,
    amFormEditing: false
  }
}