import { startAction, exceAutomation, install } from "../../helper/dom";
import { WEB_ACTIONS, PAGE_ACTIONS, APP_ACTIONS } from "../../common/const";
import { handleWebEvents, noticeWeb } from "../../helper/web";
import { RunAt } from "../../server/enum/Automation.enum";
import { appBridge } from "../../helper/bridge";
import Download from "../../buildin/Download";
import FullScreen from "../../buildin/FullScreen";
import HashElement from "../../buildin/HashElement";
import HighlightEnglishSyntax from "../../buildin/HighlightEnglishSyntax";
import KillElement from "../../buildin/KillElement";
import ReadMode from "../../buildin/ReadMode";
import TimeUpdate from "../../buildin/TimeUpdate";
import ClickElement from "../../buildin/Click";
import Scroll from "../../buildin/Scroll";
import FocusElement from "../../buildin/Focus";
import ProtectPage from "../../buildin/Protect";
import CodeCopy from "../../buildin/CodeCopy";
import GotoElement from "../../buildin/GotoElement";
import PictureInPicture from "../../buildin/PictureInPicture";
import ZenMode from "../../buildin/ZenMode";
import DarkMode from "../../buildin/DarkMode";
import Outline from "../../buildin/Outline";
import Button from "../../buildin/Button";
import Bookmark from "../../buildin/Bookmark";

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
  install((helper) => {
    new Download(helper);
    new FullScreen(helper);
    new HashElement(helper);
    new HighlightEnglishSyntax(helper);
    new KillElement(helper);
    new ReadMode(helper);
    new TimeUpdate(helper);
    new ClickElement(helper);
    new Scroll(helper);
    new FocusElement(helper);
    new ProtectPage(helper);
    new CodeCopy(helper);
    new GotoElement(helper);
    new PictureInPicture(helper);
    new ZenMode(helper);
    new DarkMode(helper);
    new Outline(helper);
    new Button(helper);
    new Bookmark(helper);
  });

  bindAppEvents();
  bindWebsiteEvents();
}

init();
