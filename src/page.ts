import { readMode, killElement, highlightEnglishSyntax, hashElement, download } from './helper/dom'
import { BUILDIN_ACTIONS } from './common/const';

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  const { method } = req
  if (method === 'getLocalStorage') {
    const objectString = JSON.stringify(localStorage);
    
    sendResponse({data: objectString});
  } else if (method === BUILDIN_ACTIONS.READ_MODE) {
    readMode()
  } else if (method === BUILDIN_ACTIONS.KILL_ELEMENT) {
    killElement()
  } else if (method === BUILDIN_ACTIONS.HIGHLIGHT_ENGLISH_SYNTAX) {
    highlightEnglishSyntax()
  } else if (method === BUILDIN_ACTIONS.HASH_ELEMENT) {
    hashElement()
  } else if (method === BUILDIN_ACTIONS.DOWNLOAD) {
    download()
  }
});