
export function noticeBg(msg, fn?) {
  chrome.runtime.sendMessage(msg, resp => {
    fn && fn(resp)
  });
}