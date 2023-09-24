import reloadOnUpdate from "virtual:reload-on-update-in-background-script";

import { GlobalEvent } from "@src/builtin/types";
import hanlder from "@src/helper/cookies";
import { isURLExist } from "@src/helper/tab";
import { getURLByArgs } from "@src/helper/url";
import { warn } from "@src/utils/log";

import {
  APP_ACTIONS,
  BUILTIN_ACTION_CONFIGS,
  BUILTIN_ACTIONS,
  PAGE_ACTIONS,
  WEB_ACTIONS,
} from "../../common/const";
import { BackMsg, PageMsg } from "../../common/types";
import { installAutomation, matchAutomations } from "../../helper/automations";
import { create as createNotice } from "../../helper/notifications";
import { highlightEnglish } from "../../helper/others";
import * as automationController from "../../server/controller/automations.controller";
import * as recordsController from "../../server/controller/records.controller";
import * as notesController from "../../server/controller/notes.controller";
import * as shortcutsController from "../../server/controller/shortcuts.controller";
import { checkUpdate, IAutomation, IShortcut } from "../../server/db/database";
import { ExtLibs } from "chrome-extension-libs";
import { initLibs } from "@src/helper/libs";

reloadOnUpdate("pages/background");

const state: {
  libs: ExtLibs | null;
  automations: IAutomation[];
  shortcuts: IShortcut[];
  sync: ReturnType<ExtLibs["Sync"]["getSync"]>;
} = {
  libs: null,
  automations: [],
  shortcuts: [],
  sync: null,
};

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
  const currentShortcuts = state.shortcuts.filter((item) =>
    aids.includes(item.aid)
  );

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
    if (chrome.runtime.lastError) {
      return;
    }
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
  loadShortcuts(state.automations.map((item) => item.id));
  handler("");
}

function noticeCurTab(data?) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (chrome.runtime.lastError) {
      return;
    }
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

interface AutomationPayload {
  type: "update" | "create" | "delete";
  new?: IAutomation;
  old: IAutomation;
}
function onUpdateAutomation(data: AutomationPayload, handler: MsgHandlerFn) {
  const { type, new: newAutomation, old } = data;
  if (type === "create") {
    notifyTabs("create", newAutomation);
  } else if (type === "update" || type === "delete") {
    notifyTabs("delete", old);

    if (type === "update" && newAutomation.active) {
      setTimeout(() => {
        notifyTabs("create", newAutomation);
      }, 100);
    }
  }
  onRefreshAutmations(handler);
}

function notifyTabs(type: "update" | "create" | "delete", data: IAutomation) {
  chrome.tabs.query({ url: data.pattern }, function (tabs) {
    if (chrome.runtime.lastError) {
      return;
    }
    tabs.forEach((tab) => {
      runMethod(tab.id, PAGE_ACTIONS.AUTOMATION_UPDATED, {
        type,
        data,
      });
    });
  });
}

function onNewNotice(data, handler: MsgHandlerFn) {
  const { title, message, iconUrl } = data;

  createNotice(title, message, iconUrl);

  handler("");
}

function onRunMethod(data, sender, handler: MsgHandlerFn) {
  runMethod(sender.tab.id, BUILTIN_ACTIONS[data.command]);
  handler("");
}

function onListActions(handler: MsgHandlerFn) {
  const list = BUILTIN_ACTION_CONFIGS.filter((item) => item.asCommand);

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

function onCreateNote(data, handler: MsgHandlerFn) {
  const { content, domain, path, nid } = data;
  notesController.saveNote(content, domain, path, nid).then((result) => {
    handler(result, true);
  });
}

type MsgHandlerFn<T = any> = (results: T, isAsync?: boolean) => void;

function msgHandler(req: PageMsg, sender: chrome.runtime.MessageSender, resp) {
  if (chrome.runtime.lastError) {
    return;
  }
  const { action, data, callbackId } = req;

  const handler: MsgHandlerFn = (results, isAsync = false) => {
    const msg: BackMsg = {
      msg: `${action} response`,
      callbackId,
      data: results,
    };

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
  } else if (action === WEB_ACTIONS.MSG_FORWARD) {
    forwardMsg(data);
    hanlder("");
  } else if (action === PAGE_ACTIONS.ACTIVE_PAGE) {
    activePage(sender.tab);
    handler("");
  } else if (action === APP_ACTIONS.IMPORT_DATA) {
    initData();
    handler("");
  } else if (action === APP_ACTIONS.START_SYNC) {
    state.sync?.tryStartSync();
    handler("");
  } else if (action === APP_ACTIONS.STOP_SYNC) {
    state.sync?.stopSync();
    handler("");
  } else if (action === PAGE_ACTIONS.OPEN_PAGE) {
    openPage(data, handler);
  } else if (action === WEB_ACTIONS.INSTALL_AUTOMATION) {
    onInstallAutomation(data, handler);
  } else if (action === APP_ACTIONS.AUTOMATION_UPDATED) {
    onUpdateAutomation(data, handler);
  } else if (action === PAGE_ACTIONS.NOTICE) {
    onNewNotice(data, handler);
  } else if (action === APP_ACTIONS.RUN_COMMAND) {
    onRunMethod(data, sender, handler);
  } else if (action === APP_ACTIONS.LIST_ACTIONS) {
    onListActions(handler);
  } else if (action === PAGE_ACTIONS.EXEC_INSTRUCTIONS) {
    onExecInstructions(data, handler);
  } else if (action === BUILTIN_ACTIONS.HIGHLIGHT_ENGLISH_SYNTAX) {
    onHightlighting(data, handler);
  } else if (action === PAGE_ACTIONS.CREATE_NOTE) {
    onCreateNote(data, handler);
  } else if (action === PAGE_ACTIONS.CONNECT) {
    onPingpong(sender.tab, handler);
  } else if (action === PAGE_ACTIONS.PING) {
    onPingpong(sender.tab, handler);
  }
}

function onPingpong(tab: chrome.tabs.Tab, handler: MsgHandlerFn) {
  handler(tab?.active);
}

function forwardMsg(msg) {
  const { extId, payload } = msg;

  if (extId && payload) {
    chrome.runtime.sendMessage(extId, payload);
  }
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

  if (toURL || url === "") {
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
    if (chrome.runtime.lastError) {
      return;
    }
  });
}

function onContextMenuClicked(info: chrome.contextMenus.OnClickData) {
  if (chrome.runtime.lastError) {
    return;
  }
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (chrome.runtime.lastError) {
      return;
    }
    runMethod(tabs[0].id, BUILTIN_ACTIONS[info.menuItemId]);
  });
}

function initCommands() {
  chrome.contextMenus.removeAll();
  BUILTIN_ACTION_CONFIGS.filter((item) => item.asCommand).forEach((item) => {
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
  const pageAutomations = matchAutomations(state.automations, url);

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
    if (chrome.runtime.lastError) {
      return;
    }
    const url = tabs[0].url;

    if (url) {
      updateBadgeByURL(url);
    }
  });
}

chrome.tabs.onUpdated.addListener(function () {
  if (chrome.runtime.lastError) {
    return;
  }
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    if (chrome.runtime.lastError) {
      return;
    }
    if (tabs[0] && tabs[0].url) {
      updateBadge(tabs[0].url);
    }
  });
});

function loadAutomations() {
  return automationController.getList().then((resp) => {
    state.automations = <IAutomation[]>resp.data;

    return state.automations;
  });
}

function loadShortcuts(aids: number[]) {
  return shortcutsController.queryByAids(aids).then((resp) => {
    state.shortcuts = resp.data;
  });
}

async function initData() {
  const automations = await loadAutomations();
  loadShortcuts(automations.map((item) => item.id));
}

async function init() {
  await checkUpdate();
  state.libs = await initLibs();
  state.sync = state.libs.Sync.getSync();
  await initData();
  chrome.runtime.onInstalled.addListener(() => {
    if (chrome.runtime.lastError) {
      return;
    }
    initCommands();
  });
  chrome.tabs.onActivated.addListener((tab) => {
    if (chrome.runtime.lastError) {
      return;
    }
    updateBadgeByCurrentTab();
    runMethod(tab.tabId, PAGE_ACTIONS.RECONNECT);
  });
}

init();
