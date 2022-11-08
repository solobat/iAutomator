
export const PAGE_ACTIONS = {
  RECORD: 'recordAction',
  AUTOMATIONS: 'getAutomations',
  REFRESH_AUTOMATIONS: 'refreshAutomations',
  NOTICE: 'createNotice',
  EXEC_INSTRUCTIONS: 'execInstructions'
}

export const WEB_ACTIONS = {
  INSTALL_AUTOMATION: 'installAutomation',
  INSTALL_DONE: 'installDone'
}

export const APP_ACTIONS = {
  IMPORT_DATA: 'importData',
  RUN_COMMAND: 'runCommand',
  LIST_ACTIONS: 'listActions',
  MSG_RESP: 'msgResp',
  START_SYNC: 'startSync',
  STOP_SYNC: 'stopSync'
}

export const IFRAME_ID = 'steward-helper-iframe'

export const REDO_DELAY = 2 * 1000

export const ROUTE_CHANGE_TYPE = {
  POP_STATE: 'popstate',
  LINK: 'link',
  PUSH_STATE: 'pushstate'
}

export const BUILDIN_ACTIONS = {
  HIGHLIGHT_ENGLISH_SYNTAX: 'highlightEnglishSyntax',
  KILL_ELEMENT: 'killElement',
  READ_MODE: 'readMode',
  ZEN_MODE: 'zenMode',
  HASH_ELEMENT: 'hashElement',
  CODE_COPY: 'codeCopy',
  GOTO_ELEMENT: 'gotoElement',
  DOWNLOAD: 'download',
  FULL_SCREEN: 'fullScreen',
  TIME_UPDATE: 'timeupdate',
  CLICK: 'click',
  FOCUS: 'focus',
  PROTECT: 'protect',
  PICTURE_IN_PICTURE: 'pictureInPicture',
  DARK_MODE: 'darkMode',
  OUTLINE: 'outline',
  BUTTON: 'button'
}

export const BUILDIN_ACTION_CONFIGS = [
  {
    name: 'READ_MODE',
    title: 'Read Mode',
    contexts: ['all'] as any[],
    asCommand: true
  },
  {
    name: 'DARK_MODE',
    title: 'Dark Mode',
    contexts: ['all'],
    asCommand: true
  },
  {
    name: 'KILL_ELEMENT',
    title: 'Kill Element',
    contexts: ['all'],
    asCommand: true
  },
  {
    name: 'PROTECT',
    title: 'Page Protect',
    contexts: ['all'],
    asCommand: true
  },
  {
    name: 'HIGHLIGHT_ENGLISH_SYNTAX',
    title: 'English Syntax highlighting',
    contexts: ['all'],
    asCommand: true
  },
  {
    name: 'HASH_ELEMENT',
    title: 'Add anchor for elements',
    contexts: ['all'],
    asCommand: true
  },
  {
    name: 'TIME_UPDATE',
    title: 'Add time tag for video',
    contexts: ['all'],
    asCommand: true
  },
  {
    name: 'DOWNLOAD',
    title: 'Download element',
    contexts: ['all'],
    asCommand: true
  },
  {
    name: 'FULL_SCREEN',
    title: 'FullScreen element',
    contexts: ['all'],
    asCommand: true
  },
  {
    name: 'CODE_COPY',
    title: 'Code copy',
    contexts: ['all'],
    asCommand: true
  },
  {
    name: 'CLICK',
    title: 'Click',
    contexts: ['all'],
    asCommand: false
  },
  {
    name: 'FOCUS',
    title: 'Focus',
    contexts: ['all'],
    asCommand: false
  },
  {
    name: 'GOTO_ELEMENT',
    title: 'Goto element',
    contexts: ['all'],
    asCommand: false
  },
  {
    name: 'PICTURE_IN_PICTURE',
    title: 'Start PIP mode',
    contexts: ['all'],
    asCommand: true
  },
  {
    name: 'ZEN_MODE',
    title: 'Zen mode',
    contexts: ['all'],
    asCommand: true
  },
  {
    name: 'OUTLINE',
    title: 'Outline',
    contexts: ['all'],
    asCommand: true
  },
  {
    name: 'BUTTON',
    title: 'button',
    contexts: ['all'],
    asCommand: false
  }
]

export const STORAGE_KEYS = {
  SYNC_INTERVAL: 'sync_interval',
  AUTO_SYNC: 'auto_sync'
}

export const SYNC_INTERVAL_OPTIONS = [
  { label: '10s', value: 10 * 1000 },
  { label: '30s', value: 30 * 1000 },
  { label: '1min', value: 60 * 1000 },
  { label: '5mins', value: 5 * 60 * 1000 },
  { label: '30mins', value: 30 * 60 * 1000 },
]

export const SYNC_STATUS = {
  WAIT: 'wait',
  BEGIN: 'begin',
  SUCCESS: 'success',
  FAIL: 'fail'
}

export const WEBDAV_MIN_SYNC_INTERVAL = SYNC_INTERVAL_OPTIONS[0].value;

export const WEBDAV_MAX_SYNC_INTERVAL = SYNC_INTERVAL_OPTIONS[4].value;