import $ from "jquery";

import { BUILDIN_ACTIONS, ROUTE_CHANGE_TYPE } from "../common/const";
import { Base } from "./Base";
import { ActionHelper, ExecOptions } from "./types";

export interface ScrollExecOptions extends ExecOptions {
  // speed of scrolling with unit: px/s
  speed?: number;
  // css-selector of next page button
  nextBtn?: string;
}

function isAtBottom() {
  return window.pageYOffset >= document.body.scrollHeight - window.innerHeight;
}

export class Scroll extends Base<ScrollExecOptions> {
  name = BUILDIN_ACTIONS.SCROLL;

  constructor(helper: ActionHelper<Base>) {
    super(helper, {
      esc2exit: true,
      shouldRecord: true,
      shouldRedo: true,
      defaultArgs: {
        speed: 20,
      },
    });
  }

  private afId = 0;
  private speed = 20;

  private tryNextPage() {
    if (this.runtimeOptions.nextBtn) {
      document
        .querySelector<HTMLDivElement | HTMLButtonElement>(
          this.runtimeOptions.nextBtn
        )
        .click();
    }
  }

  private scrollToSmoothly(pos: number, time: number) {
    const currentPos = window.pageYOffset;
    let start = null;

    if (time == null) {
      time = 500;
    }

    pos = +pos;
    time = +time;

    const step = (currentTime: number) => {
      if (isAtBottom()) {
        setTimeout(() => {
          this.tryNextPage();
          this.callNext(this.runtimeOptions);
        }, 1000);
        return;
      }
      start = !start ? currentTime : start;
      const progress = currentTime - start;
      if (currentPos < pos) {
        window.scrollTo(0, ((pos - currentPos) * progress) / time + currentPos);
      } else {
        window.scrollTo(0, currentPos - ((currentPos - pos) * progress) / time);
      }
      if (progress < time) {
        this.afId = window.requestAnimationFrame(step);
      } else {
        window.scrollTo(0, pos);
      }
    };

    this.afId = window.requestAnimationFrame(step);
  }

  private stopScroll() {
    window.cancelAnimationFrame(this.afId);
  }

  private startScroll(speed: number) {
    const restHeight = document.body.scrollHeight - window.pageYOffset;
    this.scrollToSmoothly(
      document.body.scrollHeight,
      (restHeight / speed) * 1000
    );
  }

  private initScroll(speed: number) {
    this.speed = speed;
    this.startScroll(speed);
    const onVisibleChange = (hidden: boolean) => {
      if (!hidden && this.active) {
        this.startScroll(speed);
      } else {
        this.stopScroll();
      }
    };
    this.helper.emitter.on("visibilitychange", onVisibleChange);

    this.resetFns.push(() => {
      this.stopScroll();
    });
  }

  bindEvents() {
    $(document).on("click", "button", (event) => {
      const elem = event.target;

      if ($(elem).is(this.runtimeOptions.nextBtn)) {
        setTimeout(() => {
          this.reExecute(ROUTE_CHANGE_TYPE.LINK);
        }, 1000);
      }
    });
  }

  reExecute(type: string) {
    if (type !== ROUTE_CHANGE_TYPE.POP_STATE) {
      this.active = true;
      window.scrollTo(0, 0);
      this.startScroll(this.speed);
    }
  }

  execute(elem, options: Partial<ScrollExecOptions>) {
    const { speed = 20 } = options;
    this.runtimeOptions = options;

    this.initScroll(speed);
    this.recordIfNeeded(options);

    return true;
  }
}
