
export const PAGE_ACTIONS = {
  RECORD: 'recordAction',
  AUTOMATIONS: 'getAutomations',
  REFRESH_AUTOMATIONS: 'refreshAutomations'
}

export const WEB_ACTIONS = {
  INSTALL_AUTOMATION: 'installAutomation',
  INSTALL_DONE: 'installDone'
}

export const APP_ACTIONS = {
  IMPORT_DATA: 'importData'
}

export const IFRAME_ID = 'steward-helper-iframe'

export const BUILDIN_ACTIONS = {
  HIGHLIGHT_ENGLISH_SYNTAX: 'highlightEnglishSyntax',
  KILL_ELEMENT: 'killElement',
  READ_MODE: 'readMode',
  HASH_ELEMENT: 'hashElement',
  CODE_COPY: 'codeCopy',
  GOTO_ELEMENT: 'gotoElement',
  DOWNLOAD: 'download',
  FULL_SCREEN: 'fullScreen',
  TIME_UPDATE: 'timeupdate',
  CLICK: 'click'
}

export const BUILDIN_ACTION_CONFIGS = [
  {
    name: 'READ_MODE',
    title: 'Read Mode',
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
    name: 'GOTO_ELEMENT',
    title: 'Goto element',
    contexts: ['all'],
    asCommand: false
  }
]