import { BUILTIN_ACTIONS, COMMON_ACTIONS } from "../common/const";
import { Base } from "./Base";
import { ExecOptions } from "./types";

interface CommonExecOptions extends ExecOptions {
  action: keyof typeof COMMON_ACTIONS;
}
const actionFns = {
  scrollToTop,
  scrollToBottom,
  reload,
  forwardVideo,
  rewindVideo,
  videoVolumeUp,
  videoVolumeDown,
  videoRateUp,
  videoRateDown,
};

export class CommonAction extends Base {
  name = BUILTIN_ACTIONS.COMMON;

  execute(elem, options: Partial<CommonExecOptions>) {
    const { action } = options;

    const fn = actionFns[action];

    fn?.();

    return true;
  }
}

function scrollToTop() {
  window.scrollBy(0, -document.body.scrollHeight);
}

function scrollToBottom() {
  window.scrollBy(0, document.body.scrollHeight);
}

function reload() {
  location.reload();
}

function forwardVideo() {
  const video = document.querySelector("video");
  if (video) {
    video.currentTime += 10;
  }
}

function rewindVideo() {
  const video = document.querySelector("video");
  if (video) {
    video.currentTime -= 10;
  }
}

function videoVolumeUp() {
  const video = document.querySelector("video");
  if (video) {
    video.volume += 0.1;
  }
}

function videoVolumeDown() {
  const video = document.querySelector("video");
  if (video) {
    video.volume -= 0.1;
  }
}

function videoRateUp() {
  const video = document.querySelector("video");
  if (video) {
    video.playbackRate *= 2;
  }
}

function videoRateDown() {
  const video = document.querySelector("video");
  if (video) {
    video.playbackRate /= 2;
  }
}
