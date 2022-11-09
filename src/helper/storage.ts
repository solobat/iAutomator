import browser from "webextension-polyfill";

export function getAll(tabId, params = {}) {
  return browser.tabs.sendMessage(tabId, {
    method: "getLocalStorage",
  });
}

function getTab() {
  return browser.tabs.query({ active: true });
}

export default async function hanlder(req) {
  const { data, action } = req;

  if (action === "storages.getAll") {
    const tabs = await getTab();
    return getAll(data.tabId || tabs[0].id, data);
  } else {
    return Promise.resolve({});
  }
}
