import packageJson from "./package.json";

const manifest: chrome.runtime.ManifestV3 = {
  manifest_version: 3,
  name: packageJson.name,
  version: packageJson.version,
  description: packageJson.description,
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
      css: ["assets/css/contentStyle.chunk.css"],
    },
  ],
  permissions: ["tabs", "contextMenus", "notifications"],
  optional_permissions: ["background", "clipboardWrite"],
  commands: {
    readMode: {
      description: "Read Mode",
    },
    killElement: {
      description: "Kill Elements",
    },
    highlightEnglishSyntax: {
      description: "English Syntax highlighting",
    },
    hashElement: {
      description: "Add anchor for elements",
    },
    download: {
      description: "Download element",
    },
    fullScreen: {
      description: "FullScreen element",
    },
    codeCopy: {
      description: "Code copy",
    },
    outline: {
      description: "Outline",
    },
  },
  host_permissions: ["http://*/*", "https://*/*"],
  web_accessible_resources: [
    {
      resources: [
        "assets/js/*.js",
        "assets/css/*.css",
        "icon16.png",
        "icon48.png",
      ],
      matches: ["*://*/*"],
    },
  ],
};

export default manifest;
