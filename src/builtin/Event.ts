import $ from "jquery";

import { GlobalEvents } from "@src/helper/event";

import { BUILDIN_ACTIONS } from "../common/const";
import { Base } from "./Base";
import { ExecOptions } from "./types";

export interface EventExecOptions extends ExecOptions {
  events: string;
  selector?: string;
}

export class OnEvent extends Base {
  name = BUILDIN_ACTIONS.EVENT;

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

  private listenEvents(elem: HTMLElement, options: Partial<EventExecOptions>) {
    const { events: eventName, selector } = options;
    const isGlobal = GlobalEvents().isGlobal(eventName);
    const handler = async (event) => {
      const nextOptions: ExecOptions = isGlobal
        ? event
        : {
            value: await this.getEventValue(eventName, event),
          };

      this.callNext(options, nextOptions);
      this.broadcast(options, nextOptions);
    };
    if (isGlobal) {
      this.helper.emitter.on(eventName, handler);
    } else if (this.isBom(eventName)) {
      window.addEventListener(eventName, handler);
    } else {
      if (selector) {
        $(selector).on(eventName, handler);
      } else {
        elem.addEventListener(eventName, handler);
      }
    }
  }

  execute(elem, options: Partial<EventExecOptions>) {
    const { events } = options;
    if (events) {
      this.listenEvents(elem, options);
    }
    this.recordIfNeeded(options);

    return true;
  }
}
