import { readMode, killElement, highlightEnglishSyntax } from './helper/dom'
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
  } else if (method === 'highlightEnglishSyntax') {
    highlightEnglishSyntax()
  }
});