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
    note: "Create note",
    focus: "Focus",
    goto_element: "Goto element",
    start_pip_mode: "Start PIP mode",
    zen_mode: "Zen mode",
    outline: "Outline",
    button: "Button",
    bookmark: "Bookmark",
    scroll: "Scroll",
    redirect: "Redirect",
    event: "event",
    set_value: "Set value",
    active: "active",
    allow_copying: "Allow copying",
    scrollbar: "Scrollbar position",
    open_page: "Open page",
    attributes: "Modify attributes",
    set_title: "Set title",
    reload: "Reload",
    single_tab: "Single tab",
    wait: "Wait",
    close_page: "Close page",
    text_replacing: "Text replacing",
    style: "Style",
    common_action: "Common action",
    require: "Require",
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
    note: "笔记",
    focus: "聚焦",
    goto_element: "跳转到元素",
    start_pip_mode: "开启画中画模式",
    zen_mode: "禅模式",
    outline: "大纲",
    button: "按钮",
    bookmark: "书签",
    scroll: "自动滚动",
    redirect: "重定向",
    event: "事件",
    set_value: "设值",
    active: "选中",
    allow_copying: "允许复制",
    scrollbar: "滚动条位置",
    open_page: "打开页面",
    attributes: "修改元素属性",
    set_title: "页面标题",
    reload: "重新加载",
    single_tab: "标签唯一",
    wait: "等待",
    close_page: "关闭页面",
    text_replacing: "文本替换",
    style: "样式",
    common_action: "常用操作",
    require: "判断",
  },
};

// const lang = chrome.i18n.getUILanguage().replace("-", "_");
const lang = "zh_CN";

function t(key: string): string {
  const texts = local_i18n[lang] ?? local_i18n.en;

  return texts[key] ?? key;
}

export const PAGE_ACTIONS = {
  CONNECT: "connect",
  PING: "ping",
  RECONNECT: "reconnect",
  RECORD: "recordAction",
  AUTOMATIONS: "getAutomations",
  PAGE_DATA: "getPageData",
  GLOABL_EVENT_EMITTED: "globalEventEmitted",
  GLOBAL_EVENT_RECEIVED: "globalEventReceived",
  REFRESH_AUTOMATIONS: "refreshAutomations",
  REFRESH_SHORTCUTS: "refreshShortcuts",
  OPEN_PAGE: "openPage",
  ACTIVE_PAGE: "activePage",
  NOTICE: "createNotice",
  EXEC_INSTRUCTIONS: "execInstructions",
  CREATE_NOTE: "createNote",
  DISCARD_TAB: "discardTab",
  AUTOMATION_UPDATED: "automationUpdated",
};

export const WEB_ACTIONS = {
  INSTALL_AUTOMATION: "installAutomation",
  INSTALL_DONE: "installDone",
  MSG_FORWARD: "msgForward",
};

export const APP_ACTIONS = {
  IMPORT_DATA: "importData",
  RUN_COMMAND: "runCommand",
  LIST_ACTIONS: "listActions",
  MSG_RESP: "msgResp",
  START_SYNC: "startSync",
  STOP_SYNC: "stopSync",
  AUTOMATION_UPDATED: "automationUpdated",
};

export const IFRAME_ID = "steward-helper-iframe";

export const REDO_DELAY = 2 * 1000;

export const ROUTE_CHANGE_TYPE = {
  POP_STATE: "popstate",
  LINK: "link",
  PUSH_STATE: "pushstate",
};

export type BuiltInActionName = keyof typeof BUILTIN_ACTIONS;

export const COMMON_ACTIONS = [
  "scrollToTop",
  "scrollToBottom",
  "forwardVideo",
  "rewindVideo",
  "videoVolumeUp",
  "videoVolumeDown",
  "videoRateUp",
  "videoRateDown",
  "nextPage",
  "prevPage",
  "scrollItemDown",
  "scrollItemUp",
  "reload",
  "selectDom",
  "call",
] as const;

export const BUILTIN_ACTIONS = {
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
  NOTE: "note",
  TITLE: "title",
  ATTRIBUTES: "attributes",
  OPEN_PAGE: "openPage",
  SCROLLBAR: "scrollbar",
  ALLOW_COPYING: "allowCopying",
  ACTIVE: "active",
  SET_VALUE: "setValue",
  EVENT: "event",
  REDIRECT: "redirect",
  SCROLL: "scroll",
  FOCUS: "focus",
  COMMON: "common",
  REQUIRE: "require",
  PROTECT: "protect",
  PICTURE_IN_PICTURE: "pictureInPicture",
  DARK_MODE: "darkMode",
  OUTLINE: "outline",
  BUTTON: "button",
  BOOKMARK: "bookmark",
  RELOAD: "reload",
  SINGLE_TAB: "singleTab",
  WAIT: "wait",
  CLOSE_PAGE: "closePage",
  TEXT_REAPLCING: "textReplacing",
  STYLE: "style",
};

type CommandContext = "all";
export interface BuildInActionConfig {
  name: BuiltInActionName;
  title: string;
  contexts: CommandContext[]; // 定义具体类型
  asCommand: boolean;
}

export const BUILTIN_ACTION_CONFIGS: BuildInActionConfig[] = [
  {
    name: "READ_MODE",
    title: t("read_mode"),
    contexts: ["all"],
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
    asCommand: false,
  },
  {
    name: "COMMON",
    title: t("common_action"),
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
    name: "REQUIRE",
    title: t("require"),
    contexts: ["all"],
    asCommand: false,
  },
  {
    name: "STYLE",
    title: t("style"),
    contexts: ["all"],
    asCommand: false,
  },
  {
    name: "NOTE",
    title: t("note"),
    contexts: ["all"],
    asCommand: false,
  },
  {
    name: "TITLE",
    title: t("set_title"),
    contexts: ["all"],
    asCommand: false,
  },
  {
    name: "SCROLL",
    title: t("scroll"),
    contexts: ["all"],
    asCommand: true,
  },
  {
    name: "REDIRECT",
    title: t("redirect"),
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
  {
    name: "RELOAD",
    title: t("reload"),
    contexts: ["all"],
    asCommand: false,
  },
  {
    name: "SINGLE_TAB",
    title: t("single_tab"),
    contexts: ["all"],
    asCommand: false,
  },
  {
    name: "WAIT",
    title: t("wait"),
    contexts: ["all"],
    asCommand: false,
  },
  {
    name: "CLOSE_PAGE",
    title: t("close_page"),
    contexts: ["all"],
    asCommand: false,
  },
  {
    name: "TEXT_REAPLCING",
    title: t("text_replacing"),
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
  required?: boolean;
  optionalValues?: ActionArgValue[];
  suffix?: string;
}

export interface BUILDIN_ACTION_FIELD_CONFIG {
  value: string;
  label: string;
  args?: ActionArg[];
}

export const BUILDIN_ACTION_FIELD_CONFIGS: BUILDIN_ACTION_FIELD_CONFIG[] = [
  {
    value: BUILTIN_ACTIONS.RELOAD,
    label: t("reload"),
    args: [
      {
        tips: "The interval at which to reload.",
        name: "interval",
        type: "number",
        value: 5,
        defaultValue: 5,
        required: true,
      },
      {
        tips: "Start reloading when the element exists.",
        name: "start",
        type: "string",
        value: "",
        defaultValue: "",
      },
      {
        tips: "Stop reloading when the element exists.",
        name: "stop",
        type: "string",
        value: "",
        defaultValue: "",
      },
    ],
  },
  {
    value: BUILTIN_ACTIONS.READ_MODE,
    label: t("read_mode"),
    args: [
      {
        name: "autoScroll",
        type: "boolean",
        value: true,
        defaultValue: true,
        tips: "Whether to scroll to the element automatically.",
      },
      {
        tips: "Whether to enable read mode using meta key (e.g. Ctrl key on Windows or Command key on Mac).",
        name: "metaKey",
        type: "boolean",
        value: false,
        defaultValue: false,
      },
    ],
  },
  {
    value: BUILTIN_ACTIONS.REQUIRE,
    label: t("read_mode"),
    args: [
      {
        tips: "Expression",
        name: "expression",
        type: "string",
        value: "",
        defaultValue: "",
      },
    ],
  },
  {
    value: BUILTIN_ACTIONS.DARK_MODE,
    label: t("dark_mode"),
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
      {
        tips: "Follow the system theme for applying the dark mode",
        name: "system",
        type: "boolean",
        defaultValue: false,
        value: false,
      },
    ],
  },
  {
    value: BUILTIN_ACTIONS.BOOKMARK,
    label: t("bookmark"),
    args: [
      {
        tips: "CSS-Selector of the target items",
        name: "item",
        type: "string",
        required: true,
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
    value: BUILTIN_ACTIONS.COMMON,
    label: t("common_action"),
    args: [
      {
        tips: "Common actions",
        name: "action",
        type: "string",
        value: "",
        defaultValue: "",
        placeholder: "",
        optionalValues: COMMON_ACTIONS as unknown as string[],
      },
    ],
  },
  {
    value: BUILTIN_ACTIONS.CODE_COPY,
    label: t("code_copy"),
    args: [
      {
        tips: "The child of the <pre> tag to copy",
        name: "inpre",
        type: "boolean",
        value: false,
        defaultValue: false,
      },
      {
        tips: "The <pre> tag to copy",
        name: "pre",
        type: "boolean",
        value: false,
        defaultValue: false,
      },
      {
        tips: "Elements to remove",
        name: "rm",
        type: "string",
        value: "",
        defaultValue: "",
        placeholder: "css selector",
      },
      {
        tips: "Position of the copy button",
        name: "pos",
        type: "string",
        value: "tl",
        defaultValue: "tl",
        placeholder: "tl|tr",
        optionalValues: ["tl", "tr"],
      },
    ],
  },
  {
    value: BUILTIN_ACTIONS.CLICK,
    label: t("click"),
  },
  {
    value: BUILTIN_ACTIONS.STYLE,
    label: t("style"),
    args: [
      {
        tips: "content of the style",
        name: "content",
        type: "string",
        defaultValue: "",
        value: "",
      },
      {
        tips: "type of style",
        name: "type",
        type: "string",
        value: "",
        defaultValue: "",
        placeholder: "full",
        optionalValues: ["full"],
      },
    ],
  },
  {
    value: BUILTIN_ACTIONS.FOCUS,
    label: t("focus"),
    args: [
      {
        tips: "to blur",
        name: "blur",
        type: "boolean",
        defaultValue: false,
        value: false,
      },
    ],
  },
  {
    value: BUILTIN_ACTIONS.NOTE,
    label: t("note"),
    args: [
      {
        tips: "Content of the note",
        name: "value",
        type: "string",
        value: "",
        defaultValue: "",
      },
      {
        tips: "Save note as comment",
        name: "isComment",
        type: "boolean",
        value: false,
        defaultValue: false,
      },
    ],
  },
  {
    value: BUILTIN_ACTIONS.TITLE,
    label: t("set_title"),
    args: [
      {
        tips: "Text of the title",
        name: "title",
        type: "string",
        required: true,
      },
    ],
  },
  {
    value: BUILTIN_ACTIONS.ATTRIBUTES,
    label: t("attributes"),
    args: [
      {
        tips: "Name of the attribute",
        name: "name",
        type: "string",
        required: true,
      },
      {
        tips: "Value of the attribute",
        name: "value",
        type: "string",
        required: true,
      },
    ],
  },
  {
    value: BUILTIN_ACTIONS.SCROLLBAR,
    label: t("scrollbar"),
    args: [
      {
        tips: "Delay before scrolling starts (in seconds)",
        name: "delay",
        type: "number",
        defaultValue: 0,
        value: 0,
      },
    ],
  },
  {
    value: BUILTIN_ACTIONS.OPEN_PAGE,
    label: t("open_page"),
    args: [
      {
        tips: "URL to be opened",
        name: "url",
        type: "string",
        required: true,
      },
      {
        tips: "Type of page, such as baike or wiki",
        name: "type",
        type: "string",
        optionalValues: ["baike", "wiki"],
      },
      {
        tips: "Arguments for page type",
        name: "args",
        type: "string",
      },
      {
        tips: "To check if it already exists.",
        name: "pattern",
        type: "string",
      },
    ],
  },
  {
    value: BUILTIN_ACTIONS.EVENT,
    label: t("event"),
    args: [
      {
        tips: "Name of the event",
        name: "events",
        type: "string",
        required: true,
      },
      {
        tips: "CSS selector of the target",
        name: "selector",
        type: "string",
      },
      {
        tips: "Type of action: listen or emit",
        name: "type",
        type: "string",
        defaultValue: "listen",
        value: "listen",
        optionalValues: ["listen", "emit"],
      },
    ],
  },
  {
    value: BUILTIN_ACTIONS.SET_VALUE,
    label: t("set_value"),
    args: [
      {
        tips: "Value",
        name: "value",
        type: "string",
        value: "",
        defaultValue: "",
        required: true,
      },
    ],
  },
  {
    value: BUILTIN_ACTIONS.ACTIVE,
    label: t("active"),
  },
  {
    value: BUILTIN_ACTIONS.SCROLL,
    label: t("scroll"),
    args: [
      {
        tips: "Speed of scrolling with unit px/s",
        name: "speed",
        type: "number",
        value: 20,
        defaultValue: 20,
        suffix: "px/s",
      },
    ],
  },

  {
    value: BUILTIN_ACTIONS.BUTTON,
    label: t("button"),
    args: [
      {
        tips: "Button type. Available types are: {top|toggle|shortcut|translate}",
        name: "type",
        type: "string",
        value: "",
        defaultValue: "",
        required: true,
        optionalValues: ["top", "toggle", "shortcut", "translate"],
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
        tips: "Position of the button",
        name: "pos",
        type: "string",
        value: "",
        defaultValue: "",
        placeholder: "tl|tr|bl|br",
        optionalValues: ["tl", "tr", "bl", "br"],
      },
      {
        tips: "Min-height of the button",
        name: "mh",
        type: "string",
        value: 35,
        defaultValue: 35,
        suffix: "px",
      },
    ],
  },
  {
    value: BUILTIN_ACTIONS.OUTLINE,
    label: t("outline"),
  },
  {
    value: BUILTIN_ACTIONS.REDIRECT,
    label: t("redirect"),
    args: [
      {
        tips: "Path pattern of the from page",
        name: "from",
        type: "string",
        required: true,
      },
      {
        tips: "path pattern of the to page",
        name: "to",
        type: "string",
        required: true,
      },
      {
        tips: "Hostname of the to page",
        name: "host",
        type: "string",
        required: true,
      },
      {
        tips: "New query parameters of the URL as a string",
        name: "query",
        type: "string",
      },
      {
        tips: "Format of the query parameters: 'arr' or 'default'",
        name: "qformat",
        type: "string",
      },
    ],
  },
  {
    value: BUILTIN_ACTIONS.ALLOW_COPYING,
    label: t("allow_copying"),
    args: [],
  },
  {
    value: BUILTIN_ACTIONS.ZEN_MODE,
    label: t("zen_mode"),
    args: [
      {
        tips: "Text to be displayed",
        name: "word",
        type: "string",
        value: "Zen",
        defaultValue: "Zen",
        required: true,
      },
      {
        tips: "Delay in seconds before displaying the page",
        name: "delay",
        type: "string",
        value: 0,
        defaultValue: 0,
        placeholder: "0 means never display",
      },
      {
        tips: "Background color",
        name: "bgcolor",
        type: "string",
        value: "#35363a",
        defaultValue: "#35363a",
      },
      {
        tips: "Font color",
        name: "color",
        type: "string",
        value: "#ffffff",
        defaultValue: "#ffffff",
      },
    ],
  },
  {
    value: BUILTIN_ACTIONS.PICTURE_IN_PICTURE,
    label: t("start_pip_mode"),
    args: [],
  },
  {
    value: BUILTIN_ACTIONS.HASH_ELEMENT,
    label: t("add_anchor_for_elements"),
  },
  {
    value: BUILTIN_ACTIONS.TIME_UPDATE,
    label: t("add_time_tag_for_video"),
  },

  {
    value: BUILTIN_ACTIONS.GOTO_ELEMENT,
    label: t("goto_element"),
    args: [
      {
        tips: "Automatically navigate to target element",
        name: "auto",
        type: "boolean",
        value: false,
        defaultValue: false,
      },
      {
        tips: "Target element's CSS selector",
        name: "to",
        type: "string",
        value: "",
        defaultValue: "",
        placeholder: "css selector",
        required: true,
      },
      {
        tips: "Order to navigate through the elements",
        name: "order",
        type: "string",
        value: "asc",
        defaultValue: "asc",
        placeholder: "desc/asc",
        optionalValues: ["desc", "asc"],
      },
      {
        tips: "Handle function for the target element. Available functions: {text|trim|number|siblingText}",
        name: "handle",
        type: "string",
        value: "",
        defaultValue: "",
        placeholder: "[.selector,fn]",
        optionalValues: ["text", "trim", "number", "siblingText"],
      },
    ],
  },

  {
    value: BUILTIN_ACTIONS.SINGLE_TAB,
    label: t("single_tab"),
    args: [
      {
        tips: "Path",
        name: "path",
        type: "string",
        value: "",
        defaultValue: "",
      },
      {
        tips: "Action",
        name: "action",
        type: "string",
        value: "",
        defaultValue: "",
        optionalValues: ["tab", "video", "active"],
      },
    ],
  },

  {
    value: BUILTIN_ACTIONS.TEXT_REAPLCING,
    label: t("text_replacing"),
    args: [
      {
        tips: "Rules",
        name: "rules",
        type: "string",
        value: "",
        defaultValue: "",
      },
      {
        tips: "Selector",
        name: "selector",
        type: "string",
        value: "",
        defaultValue: "",
      },
    ],
  },

  {
    value: BUILTIN_ACTIONS.WAIT,
    label: t("wait"),
    args: [
      {
        tips: "The amount of time to wait, measured in seconds",
        name: "time",
        type: "number",
        value: 1,
        defaultValue: 1,
        suffix: "s",
      },
    ],
  },

  {
    value: BUILTIN_ACTIONS.CLOSE_PAGE,
    label: t("close_page"),
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
