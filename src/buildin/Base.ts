import { NOTICE_TARGET } from "../common/enum";
import { Emitter, EventType } from "mitt";
import { exceAutomationById } from "@src/helper/dom";
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
  recordAction(actionName: string, elem?, options?: ExecOptions);
  insertCss();
  invoke(action, data, callback, target: NOTICE_TARGET);
  actions: Base[];
  observe: (elem, cb: () => void) => void;
  onRevisible: (fn: () => void) => () => void;
  emitter: Emitter<Record<EventType, unknown>>;
}

export interface ExecOptions {
  silent?: boolean;
  metaKey?: boolean;
  next?: number;
  [prop: string]: any;
}

export const defaultExecOptions: ExecOptions = {};

interface ActionOptions {
  shouldRedo?: boolean;
  esc2exit?: boolean;
  shouldRecord?: boolean;
}
export default abstract class Base<T extends ExecOptions = ExecOptions> {
  name: string;
  helper: DomHelper;
  autoMationFn?: () => void;

  shouldRedo = false;
  ready = false;
  active = false;
  cls?: string;
  style?: string;
  shouldRecord?: boolean;
  unbindFns: Array<() => void>;
  options?: T;
  esc2exit: boolean;

  constructor(
    helper: DomHelper,
    options: ActionOptions = { shouldRedo: false, esc2exit: false }
  ) {
    this.shouldRedo = options.shouldRedo;
    this.esc2exit = options.esc2exit;
    this.shouldRecord = options.shouldRecord;

    this.helper = helper;
    this.unbindFns = [];
    helper.actions.push(this);
    this._bindEvents();
  }

  get selector() {
    return `.${this.cls}`;
  }

  // NOTE: only called by UI, automation will not call this method
  startByCommand() {
    this.helper.exec((elem, event) => {
      const options: ExecOptions = {
        metaKey: event.metaKey,
      };
      this.makeExecution(elem, options as T);
      this.ready = true;
    });
  }

  // called by UI or automation
  // execute and check result if needed
  makeExecution(elem, options: T) {
    this.options = options;
    const result = this.execute(elem, options);

    if (result) {
      setTimeout(() => {
        this.checkExecResult(elem, options);
      }, 50);
    }
    return result;
  }

  // the main logic of the action
  // NOTE: options will be partial of T when called by `this.startByEvent`
  abstract execute(elem, options?: T): boolean;

  checkExecResult(elem, options?: T) {
    // if not ready --> this.autoMationFn()
  }

  reExecute(type: string) {
    console.log("redo caused by: ", type);
  }

  private _bindEvents() {
    this.bindEvents();
    if (this.esc2exit) {
      this.helper.emitter.on("exit", () => {
        const shouldContinue = this.beforeExit();

        if (shouldContinue) {
          this.exit();
          this.afterExit();
        }
      });
    }
  }

  callNext() {
    if (this.options.next) {
      exceAutomationById(this.options.next);
    }
  }

  bindEvents() {
    return;
  }

  recordIfNeeded(options: T, elem?) {
    if (this.shouldRecord && !options.silent) {
      this.helper.recordAction(this.name, elem, options);
    }
  }

  beforeExit(): boolean {
    return true;
  }

  afterExit() {
    return;
  }

  private exit() {
    this.unbindFns.forEach((fn) => {
      fn();
    });
    this.unbindFns = [];
  }
}
