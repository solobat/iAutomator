import reloadOnUpdate from "virtual:reload-on-update-in-background-script";

import { GlobalEvent } from "@src/builtin/types";
import hanlder from "@src/helper/cookies";
import { isURLExist } from "@src/helper/tab";
import { getURLByArgs } from "@src/helper/url";
import { show, warn } from "@src/utils/log";

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
import * as shortcutsController from "../../server/controller/shortcuts.controller";
import { checkUpdate, IAutomation, IShortcut } from "../../server/db/database";

reloadOnUpdate("pages/background");

let automations: IAutomation[] = [];
let shortcuts: IShortcut[] = [];
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

function onPageData(data, handler: MsgHandlerFn) {
  const automations = getAutomationsByURL(data.url);
  const aids = automations.map((item) => item.id);
  const currentShortcuts = shortcuts.filter((item) => aids.includes(item.aid));

  if (handler) {
    handler({
      automations,
      shortcuts: currentShortcuts,
    });
  }
}

function onEventEmitted(
  data: GlobalEvent,
  originTab: chrome.tabs.Tab,
  hanlder
) {
  chrome.tabs.query({}, function (tabs) {
    tabs.forEach((tab) => {
      if (tab.id !== originTab.id) {
        runMethod(tab.id, PAGE_ACTIONS.GLOBAL_EVENT_RECEIVED, data);
      }
    });
  });
  hanlder("");
}

function onRefreshAutmations(handler: MsgHandlerFn) {
  loadAutomations().then(() => {
    updateBadgeByCurrentTab();
  });
  handler("");
}

function onRefreshShortcuts(handler: MsgHandlerFn) {
  loadShortcuts(automations.map((item) => item.id));
  handler("");
}

function noticeCurTab(data?) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    runMethod(tabs[0].id, WEB_ACTIONS.INSTALL_DONE, data);
  });
}

function onInstallAutomation(data, handler: MsgHandlerFn) {
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

function onNewNotice(data, handler: MsgHandlerFn) {
  const { title, message, iconUrl } = data;

  createNotice(title, message, iconUrl);

  handler("");
}

function onRunMethod(data, sender, handler: MsgHandlerFn) {
  runMethod(sender.tab.id, BUILDIN_ACTIONS[data.command]);
  handler("");
}

function onListActions(handler: MsgHandlerFn) {
  const list = BUILDIN_ACTION_CONFIGS.filter((item) => item.asCommand);

  handler(list);
}

function onExecInstructions(data, handler: MsgHandlerFn) {
  const { tabId, instructions } = data;

  runMethod(tabId, PAGE_ACTIONS.EXEC_INSTRUCTIONS, { instructions });
  handler("");
}

function onHightlighting(data, handler: MsgHandlerFn) {
  highlightEnglish(data.text).then((result) => {
    handler(result, true);
  });
}

type MsgHandlerFn<T = any> = (results: T, isAsync?: boolean) => void;

function msgHandler(req: PageMsg, sender: chrome.runtime.MessageSender, resp) {
  const { action, data, callbackId } = req;
  show("msgHandler::call", req, sender);

  const handler: MsgHandlerFn = (results, isAsync = false) => {
    const msg: BackMsg = {
      msg: `${action} response`,
      callbackId,
      data: results,
    };
    show("msgHandler::handler:backmsg -> ", msg);

    if (!isAsync) {
      resp(msg);
    } else {
      runMethod(sender.tab.id, APP_ACTIONS.MSG_RESP, msg);
    }
  };

  if (action === PAGE_ACTIONS.RECORD) {
    const { content, url, domain } = data;

    recordsController.saveRecord(content, url, domain);
    handler("");
  } else if (action === PAGE_ACTIONS.PAGE_DATA) {
    initCommands();
    onPageData(data, handler);
  } else if (action === PAGE_ACTIONS.GLOABL_EVENT_EMITTED) {
    onEventEmitted(data, sender.tab, hanlder);
  } else if (action === PAGE_ACTIONS.REFRESH_AUTOMATIONS) {
    onRefreshAutmations(handler);
  } else if (action === PAGE_ACTIONS.REFRESH_SHORTCUTS) {
    onRefreshShortcuts(handler);
  } else if (action === PAGE_ACTIONS.ACTIVE_PAGE) {
    activePage(sender.tab);
    handler("");
  } else if (action === APP_ACTIONS.IMPORT_DATA) {
    init();
    handler("");
  } else if (action === PAGE_ACTIONS.OPEN_PAGE) {
    openPage(data, handler);
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
  } else if (action === PAGE_ACTIONS.CONNECT) {
    onPingpong(sender.tab, handler);
  } else if (action === PAGE_ACTIONS.PING) {
    onPingpong(sender.tab, handler);
  }
}

function onPingpong(tab: chrome.tabs.Tab, handler: MsgHandlerFn) {
  handler(tab?.active);
}

async function openPage(data, hanlder: MsgHandlerFn) {
  const { type, args, url, pattern } = data;
  const toURL = getURLByArgs(type, url, args);
  const toOpen = () => {
    chrome.tabs
      .create({
        url: toURL,
      })
      .then(() => {
        hanlder(true, true);
      });
  };

  if (toURL) {
    if (pattern) {
      const isExist = await isURLExist(pattern);

      if (isExist) {
        hanlder(false, true);
      } else {
        toOpen();
      }
    } else {
      toOpen();
    }
  } else {
    warn("msgHandler::openPage[empty url]", data, toURL);
  }
}

function activePage(tab?: chrome.tabs.Tab) {
  if (tab) {
    chrome.tabs.update(tab.id, {
      active: true,
    });
  }
}

["onMessage", "onMessageExternal"].forEach((msgType) => {
  chrome.runtime[msgType].addListener(msgHandler);
});

function runMethod(tabId: number, method, data?) {
  chrome.tabs.sendMessage(tabId, { method, data }, function (response) {
    console.log(response);
  });
}

function onContextMenuClicked(info: chrome.contextMenus.OnClickData) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    runMethod(tabs[0].id, BUILDIN_ACTIONS[info.menuItemId]);
  });
}

function initCommands() {
  show("initCommands::call");

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

function getAutomationsByURL(url: string) {
  const pageAutomations = matchAutomations(automations, url);

  return pageAutomations;
}

function updateBadgeByURL(url: string) {
  const pageAutomations = getAutomationsByURL(url);
  const realNum = pageAutomations.filter((item) => item.active).length;

  badgesHelper.setItem({
    url: url,
    text: realNum ? String(realNum) : "",
  });
  updateBadge(url);
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

    return automations;
  });
}

function loadShortcuts(aids: number[]) {
  return shortcutsController.queryByAids(aids).then((resp) => {
    shortcuts = resp.data;
  });
}

async function init() {
  await checkUpdate();
  loadAutomations().then((automations) => {
    loadShortcuts(automations.map((item) => item.id));
  });
  chrome.runtime.onInstalled.addListener(() => {
    initCommands();
  });
  chrome.tabs.onActivated.addListener((tab) => {
    runMethod(tab.tabId, PAGE_ACTIONS.RECONNECT);
  });
}

init();
