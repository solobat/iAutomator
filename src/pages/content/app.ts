import { startAction, exceAutomation } from "../../helper/dom";
import { WEB_ACTIONS, PAGE_ACTIONS, APP_ACTIONS } from "../../common/const";
import { handleWebEvents, noticeWeb } from "../../helper/web";
import { RunAt } from "../../server/enum/Automation.enum";
import { appBridge } from "../../helper/bridge";

function bindAppEvents() {
  chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    const { method, data } = req;

    if (method === WEB_ACTIONS.INSTALL_DONE) {
      noticeWeb(method, data);
    } else if (method === PAGE_ACTIONS.EXEC_INSTRUCTIONS) {
      exceAutomation(data.instructions, 0, RunAt.END);
    } else if (method === APP_ACTIONS.MSG_RESP) {
      appBridge.receiveMessage(data);
    } else {
      startAction(method);
    }

    sendResponse({ msg: "ok" });
  });
}

function isTrustDomain() {
  const domains: string[] = ["localhost", "ihelpers.xyz"];

  return domains.indexOf(window.location.hostname) !== -1;
}

function bindWebsiteEvents() {
  if (isTrustDomain()) {
    document.addEventListener("ihelpers", function (event) {
      handleWebEvents(event);
    });
  }
}

function init() {
  bindAppEvents();
  bindWebsiteEvents();
}

init();
