export function getHtml() {
  const popupurl = chrome.runtime.getURL("src/pages/helper/index.html");
  const html = `
      <div id="steward-helper" class="steward-helper">
          <iframe style="display:none;" id="steward-helper-iframe" src="${popupurl}" name="steward-box" width="530" height="480" frameborder="0"></iframe>
      </div>
  `;

  return html;
}
