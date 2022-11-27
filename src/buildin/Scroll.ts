import Base, { DomHelper, ExecOptions } from "./Base";
import { BUILDIN_ACTIONS } from "../common/const";

interface ScrollExecOptions extends ExecOptions {
  // unit: px/s
  speed?: number;
}

export default class Scroll extends Base {
  name = BUILDIN_ACTIONS.SCROLL;
  shouldRecord = true;
  esc2exit = true;

  constructor(helper: DomHelper) {
    super(helper, { esc2exit: true });
  }

  private scrolling = true;
  private scrollToSmoothly(pos: number, time: number) {
    const currentPos = window.pageYOffset;
    let start = null;

    if (time == null) {
      time = 500;
    }

    pos = +pos;
    time = +time;

    const step = (currentTime: number) => {
      if (!this.scrolling) {
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
        window.requestAnimationFrame(step);
      } else {
        window.scrollTo(0, pos);
      }
    };

    window.requestAnimationFrame(step);
  }

  private startScroll(speed: number) {
    const scrollHeight = document.body.scrollHeight;
    this.scrollToSmoothly(scrollHeight, (scrollHeight / speed) * 1000);
  }

  private initScroll(speed: number) {
    this.startScroll(speed);
    const onVisibleChange = (hidden: boolean) => {
      if (!this.scrolling && !hidden) {
        this.startScroll(speed);
      }
      this.scrolling = !hidden;
    };
    this.helper.emitter.on("visibilitychange", onVisibleChange);

    this.unbindFns.push(() => {
      this.scrolling = false;
    });
    this.unbindFns.push(() =>
      this.helper.emitter.off("visibilitychange", onVisibleChange)
    );
  }

  exec(elem, options?: ScrollExecOptions) {
    const { speed = 20 } = options;

    this.initScroll(speed);
    this.recordIfNeeded(options);

    return true;
  }
}
