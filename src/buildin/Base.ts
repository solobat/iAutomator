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
  autoMationFn?: Function
  cls?: string
  style?: string
  shouldTryAgain?: boolean
  shouldRecord?: boolean

  constructor(helper: DomHelper) {
    this.helper = helper
    helper.actions.push(this)
    this.bindEvents()
  }

  start() {
    this.helper.exec((elem, event) => {
      const options: ExecOptions = {
        metaKey: event.metaKey
      }
      this.run(elem, options)
    })
  }

  run(elem, options) {
    const result = this.exec(elem, options)

    if (result) {
      setTimeout(() => {
        this.checkExecResult(elem, options)
      }, 16);
    }
    return result
  }

  exec(elem, options?: ExecOptions): boolean {
    return true
  }

  checkExecResult(elem, options?: ExecOptions) {

  }

  bindEvents() {}

  recordIfNeeded(options: ExecOptions, elem?) {
    if (this.shouldRecord && !options.silent) {
      this.helper.recordAction(this.name, elem)
    }
  }
}