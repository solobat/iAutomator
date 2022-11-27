import Base, { DomHelper, ExecOptions } from "./Base";
import { BUILDIN_ACTIONS, ROUTE_CHANGE_TYPE } from "../common/const";

interface ScrollExecOptions extends ExecOptions {
  // unit: px/s
  speed?: number;
}

export default class Scroll extends Base {
  name = BUILDIN_ACTIONS.SCROLL;

  constructor(helper: DomHelper) {
    super(helper, { esc2exit: true, shouldRecord: true, shouldRedo: true });
  }

  private afId = 0;
  private speed = 20;
  private scrollToSmoothly(pos: number, time: number) {
    const currentPos = window.pageYOffset;
    let start = null;

    if (time == null) {
      time = 500;
    }

    pos = +pos;
    time = +time;

    const step = (currentTime: number) => {
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
      if (hidden) {
        this.stopScroll();
      } else {
        this.startScroll(speed);
      }
    };
    this.helper.emitter.on("visibilitychange", onVisibleChange);

    this.unbindFns.push(() => {
      this.stopScroll();
    });
  }

  redo(type: string) {
    if (type !== ROUTE_CHANGE_TYPE.POP_STATE) {
      window.scrollTo(0, 0);
      this.startScroll(this.speed);
    }
  }

  exec(elem, options?: ScrollExecOptions) {
    const { speed = 20 } = options;

    this.initScroll(speed);
    this.recordIfNeeded(options);

    return true;
  }
}
