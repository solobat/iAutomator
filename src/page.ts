import { readMode, killElement } from './helper/dom.js'
console.log('hello steward helper...')

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  const { method } = req
  if (method === 'getLocalStorage') {
    const objectString = JSON.stringify(localStorage);
    sendResponse({data: objectString});
  } else if (method === 'readMode') {
    readMode()
  } else if (method === 'killElement') {
    killElement()
  }
});