import CookiesHandler from './helper/cookies.js'
import StoragesHandler from './helper/storage.js'

function msgHandler(req, sender, resp) {
    let data = req.data;
    let action: string = req.action;

    function hanlder(results) {
        resp({
            msg: `${action} response`,
            data: results
        })
    }

    if (action.startsWith('cookies.')) {
        CookiesHandler(req).then(hanlder)
    } else if (action.startsWith('storages.')) {
        StoragesHandler(req).then(hanlder)
    }
}

['onMessage', 'onMessageExternal'].forEach((msgType) => {
    chrome.runtime[msgType].addListener(msgHandler);
});