import CookiesHandler from './helper/cookies.js'

function msgHandler(req, sender, resp) {
    let data = req.data;
    let action: string = req.action;

    if (action.startsWith('cookies.')) {
        CookiesHandler(req).then(results => {
            resp({
                msg: `${action} response`,
                data: results
            })
        })
    }
}

['onMessage', 'onMessageExternal'].forEach((msgType) => {
    chrome.runtime[msgType].addListener(msgHandler);
});