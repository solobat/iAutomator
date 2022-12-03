import { exceAutomationById } from "@src/helper/action";
import { ActionHelper, ActionOptions, ExecOptions } from "./types";
export abstract class Base<T extends ExecOptions = ExecOptions> {
  /**
   * name of Action
   */
  name: string;
  /**
   * action helper
   */
  helper: ActionHelper<Base, T>;
  /**
   * the functions to be executed repeatedly when initialization fails
   */
  autoMationFn?: () => void;

  /**
   * is action ready
   */
  ready = false;
  private _active = false;
  /**
   * the special className of this Action to be used
   */
  cls?: string;
  /**
   * the styles of this action to be inserted into pages
   */
  style?: string;
  /**
   * cleanup functions to be executed on exit
   */
  resetFns: Array<() => void>;
  /**
   * options of action
   */
  options: ActionOptions;
  /**
   * arguments of action execution
   */
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

  /**
   * NOTE: only esc2exit can set active to false
   */
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

  /**
   * NOTE: only called by UI, automation will not call this method
   */
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

  /**
   * called by UI or automation or shortcuts
   * execute and check result if needed
   */
  makeExecution(elem, options: Partial<T>) {
    // NOTE: Avoid repeated execution
    if (this.active) {
      return;
    }
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

  /**
   * the main logic of the action
   * NOTE: options will be partial of T when called by `this.startByEvent`
   */
  abstract execute(elem, options?: Partial<T>): boolean;

  /**
   * Check if the action was executed successfully
   */
  checkExecResult(elem, options?: Partial<T>) {
    // if not ready --> this.autoMationFn()
  }

  /**
   * Define how action are executed repeatedly
   */
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

  /**
   * Run the next automation specified
   */
  callNext() {
    if (this.runtimeOptions.next) {
      exceAutomationById(this.runtimeOptions.next);
    }
  }

  /**
   * Bind events of the Action
   */
  bindEvents() {
    return;
  }

  /**
   * create a record when action executed by user command
   */
  recordIfNeeded(options: T, elem?) {
    if (this.options.shouldRecord && !options.silent) {
      this.helper.recordAction(this.name, elem, options);
    }
  }

  /**
   * Hook of before exit
   */
  beforeExit(): boolean {
    return true;
  }

  /**
   * Hook of after exit
   */
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
