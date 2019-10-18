import CookiesHandler from './helper/cookies.js'
import StoragesHandler from './helper/storage.js'
import OthersHandler from './helper/others.js'

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
    }
}

['onMessage', 'onMessageExternal'].forEach((msgType) => {
    chrome.runtime[msgType].addListener(msgHandler);
});

chrome.contextMenus.create({
    title : 'Read Mode',
    contexts: ['all'],
    onclick : function(info, tab) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
            chrome.tabs.sendMessage(tabs[0].id, {method: "readMode"}, function(response) {});  
        });
    }
});

chrome.contextMenus.create({
    title : 'Kill Element',
    contexts: ['all'],
    onclick : function(info, tab) {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
            chrome.tabs.sendMessage(tabs[0].id, {method: "killElement"}, function(response) {});  
        });
    }
});

chrome.commands.onCommand.addListener(function(command) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {method: command}, function() {});
    });
});