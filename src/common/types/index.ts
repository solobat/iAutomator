export interface PageMsg {
  action: string;
  ext_from: string;
  data: any;
  callbackId: number;
}

export interface BackMsg {
  msg: string;
  data: any;
  callbackId?: any;
}

export interface TabMeta extends chrome.tabs.Tab {
  host: string;
  hostname: string;
  pathname: string;
  hash: string;
  search: string;
}

export interface AutomationForm {
  id?: number;
  instructions?: string;
  data: Array<{ action?: string; rawArgs?: string; scope?: string }>;
  pattern: string;
}
