import reloadOnUpdate from "virtual:reload-on-update-in-background-script";

import {
  APP_ACTIONS,
  BUILDIN_ACTION_CONFIGS,
  BUILDIN_ACTIONS,
  PAGE_ACTIONS,
  WEB_ACTIONS,
} from "../../common/const";
import { BackMsg, PageMsg } from "../../common/types";
import { installAutomation, matchAutomations } from "../../helper/automations";
import { create as createNotice } from "../../helper/notifications";
import { highlightEnglish } from "../../helper/others";
import * as automationController from "../../server/controller/automations.controller";
import * as recordsController from "../../server/controller/records.controller";
import { IAutomation } from "../../server/db/database";

reloadOnUpdate("pages/background");

let automations: IAutomation[] = [];
interface BadgeItem {
  url: string;
  text: string;
}

class BadgesHelper {
  list: BadgeItem[];
  maxLength: number;

  constructor() {
    this.list = [];
    this.maxLength = 20;
  }

  getItem(url): string {
    const item = this.list.find((item) => item.url === url);

    if (item) {
      return item.text;
    } else {
      return "";
    }
  }

  setItem(item: BadgeItem) {
    const result = this.list.find((tab) => tab.url === item.url);

    if (result) {
      result.text = item.text;
    } else {
      this.list.push(item);
    }

    if (this.list.length >= this.maxLength) {
      this.list.shift();
    }
  }
}

const badgesHelper = new BadgesHelper();

function updateBadge(url) {
  if (url.startsWith("http")) {
    chrome.action.enable();
    chrome.action.setBadgeText({
      text: badgesHelper.getItem(url),
    });
  } else {
    chrome.action.disable();
    chrome.action.setBadgeText({
      text: "",
    });
  }
}

function onAutomations(data, handler) {
  const records = updateBadgeByURL(data.url);

  if (handler) {
    handler(records);
  }
}

function onRefreshAutmations(handler) {
  loadAutomations().then(() => {
    updateBadgeByCurrentTab();
  });
  handler("");
}

function noticeCurTab(data?) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    runMethod(tabs[0], WEB_ACTIONS.INSTALL_DONE, data);
  });
}

function onInstallAutomation(data, handler) {
  installAutomation(data.instructions, data.pattern, data.runAt).then(
    (resp) => {
      if (resp.code === 0) {
        createNotice(
          "Automation installed successfully",
          `Automation: 「${data.name}」`,
          chrome.runtime.getURL("img/success.png")
        );
        loadAutomations().then(() => {
          updateBadgeByCurrentTab();
        });
        noticeCurTab({
          id: data.id,
        });
      } else {
        createNotice(
          "Automation installed failed",
          `Reason: 「${resp.message}」`,
          chrome.runtime.getURL("img/fail.png")
        );
      }
    }
  );
  handler("");
}

function onNewNotice(data, handler) {
  const { title, message, iconUrl } = data;

  createNotice(title, message, iconUrl);

  handler("");
}

function onRunMethod(data, sender, handler) {
  runMethod(sender.tab, BUILDIN_ACTIONS[data.command]);
  handler("");
}

function onListActions(handler) {
  const list = BUILDIN_ACTION_CONFIGS.filter((item) => item.asCommand);

  handler(list);
}

function onExecInstructions(data, handler) {
  const { tabId, instructions } = data;

  runMethod({ id: tabId }, PAGE_ACTIONS.EXEC_INSTRUCTIONS, { instructions });
  handler("");
}

function onHightlighting(data, handler) {
  highlightEnglish(data.text).then((result) => {
    handler(result, true);
  });
}

function msgHandler(req: PageMsg, sender, resp) {
  const { action, data, callbackId } = req;
  console.log("msgHandler -> req", req);

  function handler(results, isAsync = false) {
    const msg: BackMsg = {
      msg: `${action} response`,
      callbackId,
      data: results,
    };

    if (!isAsync) {
      resp(msg);
    } else {
      runMethod(sender.tab, APP_ACTIONS.MSG_RESP, msg);
    }
  }

  if (action === PAGE_ACTIONS.RECORD) {
    const { content, url, domain } = data;

    recordsController.saveRecord(content, url, domain);
    handler("");
  } else if (action === PAGE_ACTIONS.AUTOMATIONS) {
    initCommands();
    onAutomations(data, handler);
  } else if (action === PAGE_ACTIONS.REFRESH_AUTOMATIONS) {
    onRefreshAutmations(handler);
  } else if (action === APP_ACTIONS.IMPORT_DATA) {
    init();
    handler("");
  } else if (action === WEB_ACTIONS.INSTALL_AUTOMATION) {
    onInstallAutomation(data, handler);
  } else if (action === PAGE_ACTIONS.NOTICE) {
    onNewNotice(data, handler);
  } else if (action === APP_ACTIONS.RUN_COMMAND) {
    onRunMethod(data, sender, handler);
  } else if (action === APP_ACTIONS.LIST_ACTIONS) {
    onListActions(handler);
  } else if (action === PAGE_ACTIONS.EXEC_INSTRUCTIONS) {
    onExecInstructions(data, handler);
  } else if (action === BUILDIN_ACTIONS.HIGHLIGHT_ENGLISH_SYNTAX) {
    onHightlighting(data, handler);
  }
}

["onMessage", "onMessageExternal"].forEach((msgType) => {
  chrome.runtime[msgType].addListener(msgHandler);
});

function runMethod(tab, method, data?) {
  chrome.tabs.sendMessage(tab.id, { method, data }, function (response) {
    console.log(response);
  });
}

function onContextMenuClicked(info: chrome.contextMenus.OnClickData) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    runMethod(tabs[0], BUILDIN_ACTIONS[info.menuItemId]);
  });
}

function initCommands() {
  console.log("init commands...");

  chrome.contextMenus.removeAll();
  BUILDIN_ACTION_CONFIGS.filter((item) => item.asCommand).forEach((item) => {
    chrome.contextMenus.create({
      id: item.name,
      title: item.title,
      contexts: item.contexts,
    });
  });
  chrome.contextMenus.onClicked.removeListener(onContextMenuClicked);
  chrome.contextMenus.onClicked.addListener(onContextMenuClicked);
}

function updateBadgeByURL(url: string) {
  const records = matchAutomations(automations, url);
  const realNum = records.filter((item) => item.active).length;

  badgesHelper.setItem({
    url: url,
    text: realNum ? String(realNum) : "",
  });
  updateBadge(url);

  return records;
}

function updateBadgeByCurrentTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const url = tabs[0].url;

    if (url) {
      updateBadgeByURL(url);
    }
  });
}

chrome.tabs.onActivated.addListener(function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    updateBadge(tabs[0].url);
  });
});

function loadAutomations() {
  return automationController.getList().then((resp) => {
    automations = <IAutomation[]>resp.data;
  });
}

function init() {
  loadAutomations();
  chrome.runtime.onInstalled.addListener(() => {
    initCommands();
  });
}

init();
