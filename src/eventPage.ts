import CookiesHandler from './helper/cookies.js'
import StoragesHandler from './helper/storage.js'
import OthersHandler from './helper/others.js'
import DomHelper from './helper/dom.js'

function msgHandler(req, sender, resp) {
    let action: string = req.action;

    function handler(results) {
        console.log(results)
        resp({
            msg: `${action} response`,
            data: results
        })
    }

    if (action.startsWith('cookies.')) {
        CookiesHandler(req).then(handler)
    } else if (action.startsWith('storages.')) {
        StoragesHandler(req).then(handler)
    } else if (action.startsWith('others.')) {
        OthersHandler(req).then(handler)
    } else if (action.startsWith('dom.')) {
        DomHelper(req).then(handler)
    }
}

['onMessage', 'onMessageExternal'].forEach((msgType) => {
    chrome.runtime[msgType].addListener(msgHandler);
});

function runMethod(tab, method) {
    chrome.tabs.sendMessage(tab.id, { method }, function(response) {});  
}

chrome.contextMenus.create({
    title : 'Read Mode',
    contexts: ['all'],
    onclick : function(info, tab) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
            runMethod(tabs[0], 'readMode')
        });
    }
});

chrome.contextMenus.create({
    title : 'Kill Element',
    contexts: ['all'],
    onclick : function(info, tab) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
            runMethod(tabs[0], 'killElement')
        });
    }
});

chrome.contextMenus.create({
    title : 'English Syntax highlighting',
    contexts: ['all'],
    onclick : function(info, tab) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
            runMethod(tabs[0], 'highlightEnglishSyntax')
        });
    }
});

chrome.commands.onCommand.addListener(function(command) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        runMethod(tabs[0], command)
    });
});