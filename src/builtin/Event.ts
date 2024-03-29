import $ from "jquery";

import { GlobalEvents, isComboKey, isCommonDOMEvent } from "@src/helper/event";

import { BUILTIN_ACTIONS } from "../common/const";
import { Base } from "./Base";
import { ExecOptions } from "./types";

export interface EventExecOptions extends ExecOptions {
  events: string;
  selector?: string;
  type: "emit" | "listen";
}

export class OnEvent extends Base {
  name = BUILTIN_ACTIONS.EVENT;

  private bindedKeys = new Set<string>();

  private normalizeEvent<T = ClipboardEvent | Event>(event): T {
    return event.originalEvent ? event.originalEvent : event;
  }

  private async getEventValue(
    eventName: string,
    rawEvent: ClipboardEvent | Event
  ) {
    const event = this.normalizeEvent(rawEvent);

    if (eventName === "paste") {
      return await navigator.clipboard.readText();
    } else if (eventName === "copy") {
      const elem = event.target as HTMLElement;

      if (elem.tagName === "A") {
        const href = (elem as HTMLAnchorElement).href;

        (event as ClipboardEvent).clipboardData.setData("text/plain", href);

        return href;
      } else {
        return await navigator.clipboard.readText();
      }
    } else {
      return "";
    }
  }

  private isBom(eventName: string) {
    return ["paste"].includes(eventName);
  }

  private listenEvents(
    elem: HTMLElement,
    options: Partial<EventExecOptions>,
    effect?: (options: Partial<EventExecOptions>) => void
  ) {
    const { events: eventName, selector, scope } = options;
    const isGlobal = GlobalEvents().isGlobal(eventName);
    const handler = async (event) => {
      const nextOptions: ExecOptions = isGlobal
        ? event
        : {
            value: await this.getEventValue(eventName, event),
          };

      if (effect) {
        effect(nextOptions);
      }
      this.callNext(options, nextOptions);
      this.broadcast(options, nextOptions);
    };
    if (isGlobal) {
      this.helper.emitter.on(eventName, handler);
    } else if (this.isBom(eventName)) {
      window.addEventListener(eventName, handler);
    } else if (isCommonDOMEvent(eventName)) {
      // FIXME: for backward compatibility
      if (selector) {
        $(selector).on(eventName, handler);
      } else {
        if (scope) {
          $(scope).on(eventName, handler);
        } else {
          elem.addEventListener(eventName, handler);
        }
      }
    } else {
      if (this.bindedKeys.has(eventName)) {
        return;
      } else {
        this.bindedKeys.add(eventName);
      }
      if (isComboKey(eventName)) {
        this.helper.keyboard.bindKeyCombo(eventName, ({ finalKeyEvent }) => {
          finalKeyEvent.preventDefault();
          handler(finalKeyEvent);
        });
      } else {
        this.helper.keyboard.bindKey(eventName, (event) => {
          const elem = event.originalEvent.target as any;
          const tagName = elem.tagName;

          if (
            tagName !== "INPUT" &&
            tagName !== "TEXTAREA" &&
            tagName !== "SELECT" &&
            elem.contentEditable !== "true" &&
            !isComboKeyEvent(event.originalEvent)
          ) {
            event.preventDefault();
            handler(event);
          }
        });
      }
    }
  }

  private emitEvents(options: Partial<EventExecOptions>) {
    this.helper.broadcast.emit(options.events, options);
  }

  execute(
    elem,
    options: Partial<EventExecOptions>,
    effect?: (options: Partial<EventExecOptions>) => void
  ) {
    const { events, type = "listen" } = options;

    if (events) {
      if (type === "listen") {
        this.listenEvents(elem, options, effect);
      } else {
        this.emitEvents(options);
      }
    }

    return true;
  }
}

function isComboKeyEvent(event: KeyboardEvent) {
  return event.ctrlKey || event.altKey || event.metaKey;
}
