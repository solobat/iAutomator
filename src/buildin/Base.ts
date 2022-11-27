import { NOTICE_TARGET } from "../common/enum";
import { Emitter, EventType } from "mitt";
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
  [prop: string]: any;
}

export const defaultExecOptions: ExecOptions = {};

interface ActionOptions {
  shouldRedo?: boolean;
  esc2exit?: boolean;
  shouldRecord?: boolean;
}
export default class Base {
  name: string;
  helper: DomHelper;
  autoMationFn?: () => void;
  redo?: (type: string) => void;
  shouldRedo = false;
  ready = false;
  cls?: string;
  style?: string;
  shouldRecord?: boolean;
  unbindFns: Array<() => void>;
  options?: ExecOptions;
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
    this.bindEvents();
  }

  get selector() {
    return `.${this.cls}`;
  }

  // only called by UI
  start() {
    this.helper.exec((elem, event) => {
      const options: ExecOptions = {
        metaKey: event.metaKey,
      };
      this.run(elem, options);
      this.ready = true;
    });
  }

  // called by UI or automation
  // run and check result if needed
  run(elem, options) {
    this.options = options;
    const result = this.exec(elem, options);

    if (result) {
      setTimeout(() => {
        this.checkExecResult(elem, options);
      }, 50);
    }
    return result;
  }

  exec(elem, options?: ExecOptions): boolean {
    return true;
  }

  checkExecResult(elem, options?: ExecOptions) {
    // if not ready --> this.autoMationFn()
  }

  bindEvents() {
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

  recordIfNeeded(options: ExecOptions, elem?) {
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

  exit() {
    this.unbindFns.forEach((fn) => {
      fn();
    });
    this.unbindFns = [];
  }
}
