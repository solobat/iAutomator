import { createContext, useContext } from 'react';

export const ACTIONS = {
  TAB_META: 'tabMeta',
  TAB_CHANGE: 'tabChange',
  AUTOMATION_FORM_UPDATE: 'initAutomationForm',
  AUTOMATION_FORM_CLOSE: 'automationFormClose',
  AUTOMATIONS: 'AUTOMATIONS'
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
    case ACTIONS.AUTOMATIONS:
      newState.automations = payload;
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
    amFormEditing: false,
    automations: []
  }
}

export function useModel() {
  return useContext(PageContext)
}