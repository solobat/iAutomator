import { NOTICE_TARGET } from "@src/common/enum";
import { Stack } from "@src/helper/data";
import { SimpleEvent } from "@src/utils/event";

export interface execFn {
  (elem, event): void;
}

export interface ActionCache {
  $elem: any;
  subActions: null;
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
  observe: (elem, cb: () => void) => void;
  onRevisible: (fn: () => void) => () => void;
  emitter: SimpleEvent;
}

export interface ExecOptions {
  silent?: boolean;
  metaKey?: boolean;
  next?: number;
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
