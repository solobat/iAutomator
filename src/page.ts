import { startAction } from './helper/dom'
import { BUILDIN_ACTIONS } from './common/const';

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  const { method } = req
  
  startAction(method)
});