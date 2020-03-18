import OthersHandler from './helper/others'
import DomHelper from './helper/dom'
import * as recordsController from './server/controller/records.controller'
import * as automationController from './server/controller/automations.controller'
import { PageMsg, BackMsg } from './common/types';
import { matchAutomations } from './helper/automations'

let automations = []

function msgHandler(req: PageMsg, sender, resp) {
  console.log("msgHandler -> sender", sender)
  let { action, data, callbackId } = req;

  function handler(results) {
    const msg: BackMsg = {
      msg: `${action} response`,
      callbackId,
      data: results
    }
    resp(msg)
  }

  if (action === 'recordAction') {
    const { content, url, domain } = data

    recordsController.saveRecord(content, url, domain)
    handler('')
  } else if (action === 'getAutomations') {
    handler(matchAutomations(automations, data.url))
  } else if (action === 'refreshAutomations') {
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
      runMethod(tabs[0], 'readMode')
    });
  }
});

chrome.contextMenus.create({
  title: 'Kill Element',
  contexts: ['all'],
  onclick: function (info, tab) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      runMethod(tabs[0], 'killElement')
    });
  }
});

chrome.contextMenus.create({
  title: 'English Syntax highlighting',
  contexts: ['all'],
  onclick: function (info, tab) {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      runMethod(tabs[0], 'highlightEnglishSyntax')
    });
  }
});

chrome.commands.onCommand.addListener(function (command) {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    runMethod(tabs[0], command)
  });
});

function loadAutomations() {
  automationController.getList().then((resp) => {
    automations = resp.data
  }) 
}

function init() {
  loadAutomations()
}

init()