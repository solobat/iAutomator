import OthersHandler from './helper/others'
import DomHelper from './helper/dom'
import * as recordsController from './server/controller/records.controller'
import * as automationController from './server/controller/automations.controller'
import { PageMsg, BackMsg } from './common/types';
import { IAutomation } from './server/db/database'
import { matchAutomations, installAutomation } from './helper/automations'
import { BUILDIN_ACTIONS, PAGE_ACTIONS, APP_ACTIONS, BUILDIN_ACTION_CONFIGS, WEB_ACTIONS } from './common/const';
import hanlder from './helper/others';
import { create as createNotice } from './helper/notifications';

let automations: IAutomation[] = []

interface BadgeItem {
  url: string;
  text: string;
}

class BadgesHelper {
  list: BadgeItem[]
  maxLength: number

  constructor() {
    this.list = []
    this.maxLength = 20
  }

  getItem(url): string {
    const item = this.list.find(item => item.url === url)

    if (item) {
      return item.text
    } else {
      return ''
    }
  }

  setItem(item: BadgeItem) {
    const result = this.list.find(tab => tab.url === item.url)

    if (result) {
      result.text = item.text
    } else {
      this.list.push(item)
    }

    if (this.list.length >= this.maxLength) {
      this.list.shift()
    }
  }
}

const badgesHelper = new BadgesHelper()

function updateBadge(url) {
  if (url.startsWith('http')) {
    chrome.browserAction.enable()
    chrome.browserAction.setBadgeText({
      text: badgesHelper.getItem(url)
    })
    
  } else {
    chrome.browserAction.disable()
    chrome.browserAction.setBadgeText({
      text: ''
    })
  }
}

function onAutomations(data, handler) {
  const records = updateBadgeByURL(data.url)

  if (handler) {
    handler(records)
  }
}

function onRefreshAutmations(handler) {
  loadAutomations().then(() => {
    updateBadgeByCurrentTab()
  })
  handler('')
}

function noticeCurTab(data?) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    runMethod(tabs[0], WEB_ACTIONS.INSTALL_DONE, data)
  });
}

function onInstallAutomation(data, handler) {
  installAutomation(data.instructions, data.pattern).then((resp) => {
    if (resp.code === 0) {
      createNotice('Automation installed successfully', `Automation: 「${data.name}」`,
        chrome.extension.getURL('img/success.png'))
      loadAutomations().then(() => {
        updateBadgeByCurrentTab()
      })
      noticeCurTab({
        id: data.id
      })
    } else {
      createNotice('Automation installed failed', `Reason: 「${resp.message}」`,
        chrome.extension.getURL('img/fail.png'))
    }
  })
  handler('')
}

function onNewNotice(data, handler) {
  const { title, message, iconUrl } = data
  
  createNotice(title, message, iconUrl)

  handler('')
}

function onRunMethod(data, sender, handler) {
  runMethod(sender.tab, BUILDIN_ACTIONS[data.command])
  handler('') 
}

function onListActions(handler) {
  const list = BUILDIN_ACTION_CONFIGS.filter(item => item.asCommand)

  handler(list)
}

function msgHandler(req: PageMsg, sender, resp) {
  let { action, data, callbackId } = req;

  function handler(results) {
    const msg: BackMsg = {
      msg: `${action} response`,
      callbackId,
      data: results
    }
    resp(msg)
  }

  if (action === PAGE_ACTIONS.RECORD) {
    const { content, url, domain } = data

    recordsController.saveRecord(content, url, domain)
    handler('')
  } else if (action === PAGE_ACTIONS.AUTOMATIONS) {
    onAutomations(data, handler);
  } else if (action === PAGE_ACTIONS.REFRESH_AUTOMATIONS) {
    onRefreshAutmations(handler)
  } else if (action === APP_ACTIONS.IMPORT_DATA) {
    init()
    handler('')
  } else if (action === WEB_ACTIONS.INSTALL_AUTOMATION) {
    onInstallAutomation(data, hanlder)
  } else if (action === PAGE_ACTIONS.NOTICE) {
    onNewNotice(data, handler);
  } else if (action === APP_ACTIONS.RUN_COMMAND) {
    onRunMethod(data, sender, handler)
  } else if (action === APP_ACTIONS.LIST_ACTIONS) {
    onListActions(handler);
  }
}

['onMessage', 'onMessageExternal'].forEach((msgType) => {
  chrome.runtime[msgType].addListener(msgHandler);
});

function runMethod(tab, method, data?) {
  chrome.tabs.sendMessage(tab.id, { method, data }, function (response) { });
}

function initCommands() {
  BUILDIN_ACTION_CONFIGS.filter(item => item.asCommand).forEach(item => {
    chrome.contextMenus.create({
      title: item.title,
      contexts: item.contexts,
      onclick: function (info, tab) {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
          runMethod(tabs[0], BUILDIN_ACTIONS[item.name])
        });
      }
    });
  })
}

function updateBadgeByURL(url: string) {
  const records = matchAutomations(automations, url)
  const realNum = records.filter(item => item.active).length

  badgesHelper.setItem({
    url: url,
    text: realNum ? String(realNum) : ''
  })
  updateBadge(url)

  return records
}

function updateBadgeByCurrentTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const url = tabs[0].url

    if (url) {
      updateBadgeByURL(url)
    }
  });
}

chrome.commands.onCommand.addListener(function (command) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    runMethod(tabs[0], command)
  });
});

chrome.tabs.onActivated.addListener(function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    updateBadge(tabs[0].url)
  });
})

function loadAutomations() {
  return automationController.getList().then((resp) => {
    automations = <IAutomation[]>resp.data
  }) 
}

function init() {
  loadAutomations()
  initCommands()
}

init()