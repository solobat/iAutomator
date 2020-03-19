import { IFRAME_ID } from "../common/const";

export function noticeBg(msg, fn?) {
  chrome.runtime.sendMessage(msg, resp => {
    fn && fn(resp)
  });
}

export function noticeIframe(msg) {
  const iframe: HTMLIFrameElement = <HTMLIFrameElement>document.getElementById(IFRAME_ID)
  const iframeWindow = iframe.contentWindow;

  iframeWindow.postMessage(msg, '*');
}