import { startAction, exceAutomation } from './helper/dom'
import { BUILDIN_ACTIONS, WEB_ACTIONS, PAGE_ACTIONS } from './common/const';
import { handleWebEvents, noticeWeb } from './helper/web';

function bindAppEvents() {
  chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    const { method, data } = req

    if (method === WEB_ACTIONS.INSTALL_DONE) {
      noticeWeb(method, data)
    } else if (method === PAGE_ACTIONS.EXEC_INSTRUCTIONS) {
      exceAutomation(data.instructions)
    } else {
      startAction(method)
    }
  });
}

function isTrustDomain() {
  const domains: string[] = ['localhost', 'ihelpers.app'];

  return domains.indexOf(window.location.hostname) !== -1;
}

function bindWebsiteEvents() {
  if (isTrustDomain()) {
    document.addEventListener('ihelpers', function (event) {
      handleWebEvents(event);
    })
  }
}

function init() {
  bindAppEvents()
  bindWebsiteEvents()
}

init();