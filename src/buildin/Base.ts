import { NOTICE_TARGET } from "../common/enum"

interface execFn {
  (elem, event): void;
}

interface ActionCache {
  $elem: any;
  subActions: null;
}

export interface DomHelper {
  exec(fn: execFn): void;
  actionCache: ActionCache;
  resetActionCache();
  recordAction(actionName: string, elem?);
  insertCss();
  invoke(action, data, callback, target: NOTICE_TARGET);
  actions: Base[]
}

export interface ExecOptions {
  silent?: boolean;
  metaKey?: boolean;
}

export const defaultExecOptions: ExecOptions = {
}

export default class Base {
  name: string
  helper: DomHelper
  cls?: string
  style?: string
  shouldTryAgain?: boolean

  constructor(helper: DomHelper) {
    this.helper = helper
    helper.actions.push(this)
    this.bindEvents()
  }

  start() {
    this.helper.exec((elem, event) => {
      this.exec(elem, {
        metaKey: event.metaKey
      })
    })
  }

  exec(elem, options?: ExecOptions): boolean {
    return true
  }

  bindEvents() {}
}