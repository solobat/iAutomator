import { IFRAME_ID } from "../common/const";

export function noticeBg(msg, fn?) {
  chrome.runtime.sendMessage(msg, (resp) => {
    fn && fn(resp);
  });
}

export function noticeIframe(msg) {
  const iframe: HTMLIFrameElement = <HTMLIFrameElement>(
    document.getElementById(IFRAME_ID)
  );
  const iframeWindow = iframe.contentWindow;

  iframeWindow.postMessage(msg, "*");
}

export function GlobalEvents() {
  const globalId = "global";
  const delimiter = "::";
  const eventType = {
    send: "send",
    receive: "receive",
  };

  return {
    nameForReceive(name: string) {
      return [globalId, eventType.receive, name].join(delimiter);
    },
    nameForSend() {
      return [globalId, eventType.send].join(delimiter);
    },
    isGlobal(name: string) {
      return name.startsWith(`${globalId}${delimiter}`);
    },
  };
}
