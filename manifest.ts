import packageJson from "./package.json";

const manifest: chrome.runtime.ManifestV3 = {
  manifest_version: 3,
  name: "__MSG_extName__",
  version: packageJson.version,
  description: "__MSG_extDesc__",
  default_locale: "en",
  options_page: "src/pages/options/index.html",
  background: {
    service_worker: "src/pages/background/index.js",
    type: "module",
  },
  action: {
    default_popup: "src/pages/popup/index.html",
    default_icon: "icon16.png",
  },
  icons: {
    "16": "icon16.png",
    "48": "icon48.png",
    "128": "icon128.png",
  },
  content_scripts: [
    {
      matches: ["http://*/*", "https://*/*", "<all_urls>"],
      js: ["src/pages/content/index.js"],
      run_at: "document_start",
      css: ["assets/css/contentStyle.chunk.css"],
    },
  ],
  permissions: ["storage", "tabs", "contextMenus", "notifications"],
  optional_permissions: ["background", "clipboardWrite"],
  web_accessible_resources: [
    {
      resources: [
        "assets/js/*.js",
        "assets/css/*.css",
        "img/*.png",
        "icon16.png",
        "icon48.png",
        "src/pages/helper/index.html",
      ],
      matches: ["*://*/*"],
    },
  ],
};

export default manifest;
