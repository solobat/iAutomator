import Bookmark from "../../buildin/Bookmark";
import Button from "../../buildin/Button";
import ClickElement from "../../buildin/Click";
import CodeCopy from "../../buildin/CodeCopy";
import DarkMode from "../../buildin/DarkMode";
import Download from "../../buildin/Download";
import FocusElement from "../../buildin/Focus";
import FullScreen from "../../buildin/FullScreen";
import GotoElement from "../../buildin/GotoElement";
import HashElement from "../../buildin/HashElement";
import HighlightEnglishSyntax from "../../buildin/HighlightEnglishSyntax";
import KillElement from "../../buildin/KillElement";
import Outline from "../../buildin/Outline";
import PictureInPicture from "../../buildin/PictureInPicture";
import ProtectPage from "../../buildin/Protect";
import ReadMode from "../../buildin/ReadMode";
import Redirect from "../../buildin/Redirect";
import Scroll from "../../buildin/Scroll";
import TimeUpdate from "../../buildin/TimeUpdate";
import ZenMode from "../../buildin/ZenMode";
import { APP_ACTIONS, PAGE_ACTIONS, WEB_ACTIONS } from "../../common/const";
import { exceAutomation, install, startAction } from "../../helper/action";
import { appBridge } from "../../helper/bridge";
import { handleWebEvents, noticeWeb } from "../../helper/web";
import { RunAt } from "../../server/enum/Automation.enum";

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
    new Redirect(helper);
  });

  bindAppEvents();
  bindWebsiteEvents();
}

init();
