
console.log('hello steward helper...')

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (req.method === 'getLocalStorage') {
    const objectString = JSON.stringify(localStorage);
    sendResponse({data: objectString});
  }
});