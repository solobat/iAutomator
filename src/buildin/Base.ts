import { exceAutomationById } from "@src/helper/action";
import { ActionHelper, ActionOptions, ExecOptions } from "./types";
export default abstract class Base<T extends ExecOptions = ExecOptions> {
  name: string;
  helper: ActionHelper<Base, T>;
  autoMationFn?: () => void;

  ready = false;
  private _active = false;
  cls?: string;
  style?: string;
  resetFns: Array<() => void>;
  // action options
  options: ActionOptions;
  // args
  runtimeOptions?: Partial<T>;

  constructor(
    helper: ActionHelper<Base, T>,
    options: ActionOptions<T> = {
      shouldRedo: false,
      esc2exit: false,
      withOutline: false,
      defaultArgs: {},
      defaultScope: document.body,
    }
  ) {
    this.options = options;
    this.runtimeOptions = options.defaultArgs;

    this.helper = helper;
    this.resetFns = [];
    helper.actions.push(this);
    this._bindEvents();
  }

  get selector() {
    return `.${this.cls}`;
  }

  get active() {
    return this._active;
  }

  // NOTE: only esc2exit can set active to false
  set active(val: boolean) {
    if (val !== this._active) {
      if (val) {
        this.helper.activeActions.push(this);
      } else {
        this.helper.activeActions.pop();
      }
      this._active = val;
    }
  }

  // NOTE: only called by UI, automation will not call this method
  startByCommand() {
    this.helper.prepare((elem, event) => {
      const options = {
        ...this.options.defaultArgs,
        metaKey: event?.metaKey,
      } as T;
      this.makeExecution(elem, options);
      this.ready = true;
    }, this.options);
  }

  // called by UI or automation
  // execute and check result if needed
  makeExecution(elem, options: Partial<T>) {
    this.runtimeOptions = options;
    const result = this.execute(elem, options);
    if (this.options.esc2exit) {
      this.active = true;
    }
    if (result) {
      setTimeout(() => {
        this.checkExecResult(elem, options);
      }, 50);
    }
    return result;
  }

  // the main logic of the action
  // NOTE: options will be partial of T when called by `this.startByEvent`
  abstract execute(elem, options?: Partial<T>): boolean;

  checkExecResult(elem, options?: Partial<T>) {
    // if not ready --> this.autoMationFn()
  }

  reExecute(type: string) {
    console.log("redo caused by: ", type);
  }

  private _bindEvents() {
    this.bindEvents();
    if (this.options.esc2exit) {
      this.helper.emitter.on("exit", () => {
        // NOTE: only the top action should to call exit
        if (this.helper.activeActions.top() === this) {
          // FIXME: avoid to affect other action
          setTimeout(() => {
            this.active = false;
          });

          const shouldContinue = this.beforeExit();

          if (shouldContinue) {
            this.exit();
            this.afterExit();
          }
        }
      });
    }
  }

  callNext() {
    if (this.runtimeOptions.next) {
      exceAutomationById(this.runtimeOptions.next);
    }
  }

  bindEvents() {
    return;
  }

  recordIfNeeded(options: T, elem?) {
    if (this.options.shouldRecord && !options.silent) {
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
    this.resetFns.forEach((fn) => {
      fn();
    });
    this.resetFns = [];
  }
}
