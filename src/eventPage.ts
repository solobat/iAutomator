import OthersHandler from './helper/others'
import DomHelper from './helper/dom'
import * as recordsController from './server/controller/records.controller'
import * as automationController from './server/controller/automations.controller'
import { PageMsg, BackMsg } from './common/types';
import { IAutomation } from './server/db/database'
import { matchAutomations } from './helper/automations'
import { BUILDIN_ACTIONS, PAGE_ACTIONS } from './common/const';

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
    this.list.push(item)

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
    const records = matchAutomations(automations, data.url)

    handler(records)
    badgesHelper.setItem({
      url: data.url,
      text: records.length ? String(records.length) : ''
    })
    updateBadge(data.url)
  } else if (action === PAGE_ACTIONS.REFRESH_AUTOMATIONS) {
    loadAutomations()
    handler('')
  }
}

['onMessage', 'onMessageExternal'].forEach((msgType) => {
  chrome.runtime[msgType].addListener(msgHandler);
});

function runMethod(tab, method) {
  chrome.tabs.sendMessage(tab.id, { method }, function (response) { });
}

chrome.contextMenus.create({
  title: 'Read Mode',
  contexts: ['all'],
  onclick: function (info, tab) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      runMethod(tabs[0], BUILDIN_ACTIONS.READ_MODE)
    });
  }
});

chrome.contextMenus.create({
  title: 'Kill Element',
  contexts: ['all'],
  onclick: function (info, tab) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      runMethod(tabs[0], BUILDIN_ACTIONS.KILL_ELEMENT)
    });
  }
});

chrome.contextMenus.create({
  title: 'English Syntax highlighting',
  contexts: ['all'],
  onclick: function (info, tab) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      runMethod(tabs[0], BUILDIN_ACTIONS.HIGHLIGHT_ENGLISH_SYNTAX)
    });
  }
});

chrome.contextMenus.create({
  title: 'Add anchor for elements',
  contexts: ['all'],
  onclick: function (info, tab) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      runMethod(tabs[0], BUILDIN_ACTIONS.HASH_ELEMENT)
    });
  }
});

chrome.contextMenus.create({
  title: 'Download element',
  contexts: ['all'],
  onclick: function (info, tab) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      runMethod(tabs[0], BUILDIN_ACTIONS.DOWNLOAD)
    });
  }
});

chrome.contextMenus.create({
  title: 'FullScreen element',
  contexts: ['all'],
  onclick: function (info, tab) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      runMethod(tabs[0], BUILDIN_ACTIONS.FULL_SCREEN)
    });
  }
});

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
  automationController.getList().then((resp) => {
    automations = <IAutomation[]>resp.data
  }) 
}

function init() {
  loadAutomations()
}

init()