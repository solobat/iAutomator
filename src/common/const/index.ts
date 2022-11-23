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
  BOOKMARK: "bookmark",
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
    name: "BOOKMARK",
    title: t("bookmark"),
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

export type ActionArgValue = boolean | string | number;

export interface ActionArg {
  tips?: string;
  name: string;
  type: string;
  value?: ActionArgValue;
  defaultValue?: ActionArgValue;
  placeholder?: string;
}

export interface BUILDIN_ACTION_FIELD_CONFIG {
  value: string;
  label: string;
  args?: ActionArg[];
}

export const BUILDIN_ACTION_FIELD_CONFIGS: BUILDIN_ACTION_FIELD_CONFIG[] = [
  {
    value: BUILDIN_ACTIONS.READ_MODE,
    label: "Read Mode",
    args: [
      {
        tips: "metaKey",
        name: "metaKey",
        type: "boolean",
        value: false,
        defaultValue: false,
      },
    ],
  },
  {
    value: BUILDIN_ACTIONS.DARK_MODE,
    label: "Dark Mode",
    args: [
      {
        tips: "Longitude",
        name: "long",
        type: "number",
      },
      {
        tips: "Latitude",
        name: "lat",
        type: "number",
      },
    ],
  },
  {
    value: BUILDIN_ACTIONS.BOOKMARK,
    label: "Bookmark",
    args: [
      {
        tips: "CSS-Selector of the target items",
        name: "item",
        type: "string",
      },
      {
        tips: "Refersh type: auto | manual",
        name: "refresh",
        type: "string",
        defaultValue: "manual",
        value: "manual",
      },
      {
        tips: "should notify on the title?",
        name: "nofity",
        type: "boolean",
        defaultValue: true,
        value: true,
      },
    ],
  },
  {
    value: BUILDIN_ACTIONS.ZEN_MODE,
    label: "Zen Mode",
    args: [
      {
        tips: "Text to be displayed",
        name: "word",
        type: "string",
        value: "Zen",
        defaultValue: "Zen",
      },
      {
        tips: "How long to delay displaying the page",
        name: "delay",
        type: "string",
        value: 0,
        defaultValue: 0,
        placeholder: "0 means never display",
      },
      {
        tips: "Background Color",
        name: "bgcolor",
        type: "string",
        value: "#35363a",
        defaultValue: "#35363a",
      },
      {
        tips: "Font Color",
        name: "color",
        type: "string",
        value: "#ffffff",
        defaultValue: "#ffffff",
      },
    ],
  },
  {
    value: BUILDIN_ACTIONS.PICTURE_IN_PICTURE,
    label: "PIP Mode",
    args: [],
  },
  {
    value: BUILDIN_ACTIONS.HASH_ELEMENT,
    label: "Add anchor for elements",
  },
  {
    value: BUILDIN_ACTIONS.TIME_UPDATE,
    label: "Add time tag for video",
  },
  {
    value: BUILDIN_ACTIONS.CODE_COPY,
    label: "Code copy",
    args: [
      {
        tips: "child of <pre> tag",
        name: "inpre",
        type: "boolean",
        value: false,
        defaultValue: false,
      },
      {
        tips: "<pre> tag",
        name: "pre",
        type: "boolean",
        value: false,
        defaultValue: false,
      },
      {
        tips: "Remove some elements",
        name: "rm",
        type: "string",
        value: "",
        defaultValue: "",
        placeholder: "css selector",
      },
      {
        tips: "Position of btn",
        name: "pos",
        type: "string",
        value: "tl",
        defaultValue: "tl",
        placeholder: "tl|tr",
      },
    ],
  },
  {
    value: BUILDIN_ACTIONS.CLICK,
    label: "Click",
  },
  {
    value: BUILDIN_ACTIONS.GOTO_ELEMENT,
    label: "Goto element",
    args: [
      {
        tips: "Auto Goto",
        name: "auto",
        type: "boolean",
        value: false,
        defaultValue: false,
      },
      {
        tips: "Target",
        name: "to",
        type: "string",
        value: "",
        defaultValue: "",
        placeholder: "css selector",
      },
      {
        tips: "Order",
        name: "order",
        type: "string",
        value: "asc",
        defaultValue: "asc",
        placeholder: "desc/asc",
      },
      {
        tips: "Handle, The available functions are: {text|trim|number|siblingText}",
        name: "handle",
        type: "string",
        value: "",
        defaultValue: "",
        placeholder: "[.selector,fn]",
      },
    ],
  },
  {
    value: BUILDIN_ACTIONS.BUTTON,
    label: "Add button",
    args: [
      {
        tips: "Button Type, available types are: {top|toggle|shortcut|translate}",
        name: "type",
        type: "string",
        value: "",
        defaultValue: "",
      },
      {
        tips: "CSS selector of the items",
        name: "item",
        type: "string",
        value: "",
        defaultValue: "",
        placeholder: "css selector",
      },
      {
        tips: "Position of btn",
        name: "pos",
        type: "string",
        value: "",
        defaultValue: "",
        placeholder: "tl|tr|bl|br",
      },
      {
        tips: "Min-height of btn",
        name: "mh",
        type: "string",
        value: 35,
        defaultValue: 35,
      },
    ],
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
