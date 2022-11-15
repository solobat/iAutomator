const local_i18n = {
  en: {
    read_mode: "Read Mode",
    dark_mode: "Dark Mode",
    kill_element: "Kill Element",
    page_protect: "Page Protect",
    english_syntax_highlighting: "English Syntax highlighting",
    add_anchor_for_elements: "Add anchor for elements",
    add_time_tag_for_video: "Add time tag for video",
    download_element: "Download element",
    fullscreen_element: "FullScreen element",
    code_copy: "Code copy",
    click: "Click",
    focus: "Focus",
    goto_element: "Goto element",
    start_pip_mode: "Start PIP mode",
    zen_mode: "Zen mode",
    outline: "Outline",
    button: "Button",
  },
  zh_CN: {
    read_mode: "阅读模式",
    dark_mode: "夜间模式",
    kill_element: "移除元素",
    page_protect: "页面保护",
    english_syntax_highlighting: "英语语法高亮",
    add_anchor_for_elements: "为元素添加锚点",
    add_time_tag_for_video: "为视频添加时间标签",
    download_element: "下载元素",
    fullscreen_element: "全屏元素",
    code_copy: "代码拷贝",
    click: "点击",
    focus: "聚焦",
    goto_element: "跳转到元素",
    start_pip_mode: "开启画中画模式",
    zen_mode: "禅模式",
    outline: "大纲",
    button: "按钮",
  },
};

const lang = chrome.i18n.getUILanguage().replace("-", "_");

function t(key: string): string {
  const texts = local_i18n[lang] ?? local_i18n.en;

  return texts[key] ?? key;
}

export const PAGE_ACTIONS = {
  RECORD: "recordAction",
  AUTOMATIONS: "getAutomations",
  REFRESH_AUTOMATIONS: "refreshAutomations",
  NOTICE: "createNotice",
  EXEC_INSTRUCTIONS: "execInstructions",
};

export const WEB_ACTIONS = {
  INSTALL_AUTOMATION: "installAutomation",
  INSTALL_DONE: "installDone",
};

export const APP_ACTIONS = {
  IMPORT_DATA: "importData",
  RUN_COMMAND: "runCommand",
  LIST_ACTIONS: "listActions",
  MSG_RESP: "msgResp",
  START_SYNC: "startSync",
  STOP_SYNC: "stopSync",
};

export const IFRAME_ID = "steward-helper-iframe";

export const REDO_DELAY = 2 * 1000;

export const ROUTE_CHANGE_TYPE = {
  POP_STATE: "popstate",
  LINK: "link",
  PUSH_STATE: "pushstate",
};

export const BUILDIN_ACTIONS = {
  HIGHLIGHT_ENGLISH_SYNTAX: "highlightEnglishSyntax",
  KILL_ELEMENT: "killElement",
  READ_MODE: "readMode",
  ZEN_MODE: "zenMode",
  HASH_ELEMENT: "hashElement",
  CODE_COPY: "codeCopy",
  GOTO_ELEMENT: "gotoElement",
  DOWNLOAD: "download",
  FULL_SCREEN: "fullScreen",
  TIME_UPDATE: "timeupdate",
  CLICK: "click",
  FOCUS: "focus",
  PROTECT: "protect",
  PICTURE_IN_PICTURE: "pictureInPicture",
  DARK_MODE: "darkMode",
  OUTLINE: "outline",
  BUTTON: "button",
};

export const BUILDIN_ACTION_CONFIGS = [
  {
    name: "READ_MODE",
    title: t("read_mode"),
    contexts: ["all"] as any[],
    asCommand: true,
  },
  {
    name: "DARK_MODE",
    title: t("dark_mode"),
    contexts: ["all"],
    asCommand: true,
  },
  {
    name: "KILL_ELEMENT",
    title: t("kill_element"),
    contexts: ["all"],
    asCommand: true,
  },
  {
    name: "PROTECT",
    title: t("page_protect"),
    contexts: ["all"],
    asCommand: true,
  },
  {
    name: "HIGHLIGHT_ENGLISH_SYNTAX",
    title: t("english_syntax_highlighting"),
    contexts: ["all"],
    asCommand: true,
  },
  {
    name: "HASH_ELEMENT",
    title: t("add_anchor_for_elements"),
    contexts: ["all"],
    asCommand: true,
  },
  {
    name: "TIME_UPDATE",
    title: t("add_time_tag_for_video"),
    contexts: ["all"],
    asCommand: true,
  },
  {
    name: "DOWNLOAD",
    title: t("download_element"),
    contexts: ["all"],
    asCommand: true,
  },
  {
    name: "FULL_SCREEN",
    title: t("fullscreen_element"),
    contexts: ["all"],
    asCommand: true,
  },
  {
    name: "CODE_COPY",
    title: t("code_copy"),
    contexts: ["all"],
    asCommand: true,
  },
  {
    name: "CLICK",
    title: t("click"),
    contexts: ["all"],
    asCommand: false,
  },
  {
    name: "FOCUS",
    title: t("focus"),
    contexts: ["all"],
    asCommand: false,
  },
  {
    name: "GOTO_ELEMENT",
    title: t("goto_element"),
    contexts: ["all"],
    asCommand: false,
  },
  {
    name: "PICTURE_IN_PICTURE",
    title: t("start_pip_mode"),
    contexts: ["all"],
    asCommand: true,
  },
  {
    name: "ZEN_MODE",
    title: t("zen_mode"),
    contexts: ["all"],
    asCommand: true,
  },
  {
    name: "OUTLINE",
    title: t("outline"),
    contexts: ["all"],
    asCommand: true,
  },
  {
    name: "BUTTON",
    title: t("button"),
    contexts: ["all"],
    asCommand: false,
  },
];

export const STORAGE_KEYS = {
  SYNC_INTERVAL: "sync_interval",
  AUTO_SYNC: "auto_sync",
};

export const SYNC_INTERVAL_OPTIONS = [
  { label: "10s", value: 10 * 1000 },
  { label: "30s", value: 30 * 1000 },
  { label: "1min", value: 60 * 1000 },
  { label: "5mins", value: 5 * 60 * 1000 },
  { label: "30mins", value: 30 * 60 * 1000 },
];

export const SYNC_STATUS = {
  WAIT: "wait",
  BEGIN: "begin",
  SUCCESS: "success",
  FAIL: "fail",
};

export const WEBDAV_MIN_SYNC_INTERVAL = SYNC_INTERVAL_OPTIONS[0].value;

export const WEBDAV_MAX_SYNC_INTERVAL = SYNC_INTERVAL_OPTIONS[4].value;
