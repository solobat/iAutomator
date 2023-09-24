import { NOTICE_TARGET } from "@src/common/enum";
import { Stack } from "@src/helper/data";
import { SimpleEvent } from "@src/utils/event";
import { bind, pressKey, unbind } from "keyboardjs";

export interface execFn {
  (elem, event): void;
}

export interface ActionCache {
  $elem: any;
  subActions: null;
}

export interface GlobalEvent<T = any> {
  action: string;
  payload: T;
}

interface Broadcast {
  init: () => void;

  emit: <T = any>(name: string, data: T) => void;
}

export interface ActionHelper<A, T extends ExecOptions = ExecOptions> {
  prepare(fn: execFn, options: ActionOptions): void;
  actionCache: ActionCache;
  resetActionCache();
  recordAction(actionName: string, elem?, options?: T);
  insertCss(styles: string);
  invoke(action, data, callback, target: NOTICE_TARGET);
  actions: A[];
  activeActions: Stack<A>;
  redoActions: Stack<() => void>;
  observe: (elem, cb: () => void) => void;
  onRevisible: (fn: () => void) => () => void;
  emitter: SimpleEvent;
  broadcast: Broadcast;
  keyboard: {
    bind: typeof bind;
    unbind: typeof unbind;
    pressKey: typeof pressKey;
  };
}

export type ActionRunMode = "single" | "group";

export interface ExecOptions {
  /**
   * Indicates whether a record needs to be generated when the operation is executed
   */
  silent?: boolean;
  /**
   * Whether the meta key is pressed
   */
  metaKey?: boolean;
  /**
   * ID of the next automation to be executed
   */
  next?: number;

  value?: string;

  /**
   * Name of event to be emitted
   */
  emit?: string;

  /**
   * @private index in group
   */
  index?: number;

  /**
   * @private mode of action runtime
   */
  mode?: ActionRunMode;

  /**
   * @private backup of scope
   */
  scope?: string;

  [prop: string]: any;
}

export const defaultExecOptions: ExecOptions = {};

export interface ActionOptions<T extends ExecOptions = ExecOptions> {
  shouldRedo?: boolean;
  esc2exit?: boolean;
  shouldRecord?: boolean;
  withOutline?: boolean;
  defaultArgs?: Partial<T>;
  defaultScope?: HTMLElement;
}
