import { appBridge } from './bridge'
import { WEB_ACTIONS } from '../common/const';

export function handleWebEvents(event) {
  const { action, data } = event.detail

  if (action) {
    switch(action) {
      case WEB_ACTIONS.INSTALL_AUTOMATION:
        invoke(action, data);
        break;
      default:
        break;
    }
  }
}

export function noticeWeb(action, data) {
  const event = new CustomEvent('stewardHelper', {
    detail: {
      action,
      data
    }
  })

  document.dispatchEvent(event);
}

function invoke(action, data = {}) {
  appBridge.invoke(action, data, resp => {
  });
}