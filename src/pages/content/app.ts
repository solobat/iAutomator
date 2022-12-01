import { Bookmark } from "../../builtin/Bookmark";
import { Button } from "../../builtin/Button";
import { ClickElement } from "../../builtin/Click";
import { CodeCopy } from "../../builtin/CodeCopy";
import { DarkMode } from "../../builtin/DarkMode";
import { Download } from "../../builtin/Download";
import { FocusElement } from "../../builtin/Focus";
import { FullScreen } from "../../builtin/FullScreen";
import { GotoElement } from "../../builtin/GotoElement";
import { HashElement } from "../../builtin/HashElement";
import { HighlightEnglishSyntax } from "../../builtin/HighlightEnglishSyntax";
import { KillElement } from "../../builtin/KillElement";
import { Outline } from "../../builtin/Outline";
import { PictureInPicture } from "../../builtin/PictureInPicture";
import { ProtectPage } from "../../builtin/Protect";
import { ReadMode } from "../../builtin/ReadMode";
import { Redirect } from "../../builtin/Redirect";
import { Scroll } from "../../builtin/Scroll";
import { TimeUpdate } from "../../builtin/TimeUpdate";
import { ZenMode } from "../../builtin/ZenMode";
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
