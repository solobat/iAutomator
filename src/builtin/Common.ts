import getCssSelector from "css-selector-generator";
import { BUILTIN_ACTIONS, COMMON_ACTIONS } from "../common/const";
import { Base } from "./Base";
import { ExecOptions } from "./types";
import $ from "jquery";
import { copyToClipboard } from "@src/helper/others";

interface CommonExecOptions extends ExecOptions {
  action: keyof typeof COMMON_ACTIONS;
  selector?: string;
  step?: number;
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
  prevPage,
  nextPage,
  scrollItemDown,
  scrollItemUp,
  selectDom,
  call,
};

export class CommonAction extends Base {
  name = BUILTIN_ACTIONS.COMMON;

  timers: Record<string, number> = {};

  style = `
  .ext-ih-common-scroll-current {
    outline: 1px dashed;
    font-weight: 700;
    transition: all 0.2s;
  }
  `;

  execute(
    elem,
    options: Partial<CommonExecOptions>,
    effect?: (options?: any) => any
  ) {
    const { action } = options;

    const fn = actionFns[action];

    fn?.call(this, options, effect);

    return true;
  }
}

function findCurrent(selector: string, currentSelector: string) {
  return document.querySelector(`${selector}${currentSelector}`);
}

function findSibling(
  selector: string,
  currentSelector = ".ext-ih-common-scroll-current",
  side: "prev" | "next"
) {
  const current = findCurrent(selector, currentSelector);
  const cls = currentSelector.replace(".", "");
  if (current) {
    current.classList.remove(cls);
    const sibling =
      side === "prev"
        ? current.previousElementSibling
        : current.nextElementSibling;
    if (sibling) {
      sibling.classList.add(cls);
      return sibling;
    }
  } else {
    const elem =
      getTopmostElementInViewport(document.querySelectorAll(selector)) ||
      document.querySelector(selector);
    if (elem) {
      elem.classList.add(cls);
      return elem;
    }
  }
}

function findValidSibling(
  selector: string,
  currentSelector = ".ext-ih-common-scroll-current",
  side: "prev" | "next"
) {
  let elem = findSibling(selector, currentSelector, side);
  while (elem && !$(elem).is(":visible")) {
    elem = findSibling(selector, currentSelector, side);
  }
  return elem;
}

function findValidNthSibling(
  selector: string,
  currentSelector = ".ext-ih-common-scroll-current",
  side: "prev" | "next",
  n = 1
) {
  let elem = findValidSibling(selector, currentSelector, side);
  let i = 1;
  while (i < n) {
    const item = findValidSibling(selector, currentSelector, side);

    if (item) {
      elem = item;
    } else {
      break;
    }
    i++;
  }
  return elem;
}

function scrollSibling(
  selector: string,
  currentSelector = ".ext-ih-common-scroll-current",
  side: "prev" | "next",
  n = 1
) {
  const elem = findValidNthSibling(selector, currentSelector, side, n);
  elem?.scrollIntoView({
    behavior: "smooth",
  });
}

function scrollItemDown(options: Partial<CommonExecOptions>) {
  const { selector, step = 1 } = options;
  scrollSibling(selector, ".ext-ih-common-scroll-current", "next", step);
}

function scrollItemUp(options: Partial<CommonExecOptions>) {
  const { selector, step = 1 } = options;
  scrollSibling(selector, ".ext-ih-common-scroll-current", "prev", step);
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

const prevSelectors: Array<string | (() => HTMLElement | null)> = [
  "a[rel=prev]",
  ".js-prev",
  () => selectByText(["上一页", "上一章"], "a,li,button"),
];

function applySelector(selectors: Array<string | (() => HTMLElement | null)>) {
  for (const selector of selectors) {
    let elem: HTMLElement | null;
    if (typeof selector === "string") {
      elem = document.querySelector(selector);
    } else {
      elem = selector();
    }
    if (elem) {
      return elem;
    }
  }
  return null;
}
function prevPage() {
  const elem = applySelector(prevSelectors);
  if (elem) {
    elem.click();
  }
}

function selectByText(textArr: string[], baseSelector = "div") {
  return (
    Array.from(document.querySelectorAll(baseSelector)) as HTMLElement[]
  ).find((item) => textArr.includes(item.innerText.replaceAll(/[<>]/g, "")));
}

const nextSelectors: Array<string | (() => HTMLElement | null)> = [
  "a[rel=next]",
  ".js-next",
  () => selectByText(["下一页", "下一章", "加载更多"], "a,li,button"),
];

function nextPage() {
  const elem = applySelector(nextSelectors);
  if (elem) {
    elem.click();
  }
}

function selectDom(this: CommonAction) {
  this.helper.prepare(
    (elem) => {
      const selector = getCssSelector(elem, { blacklist: [/ext-hp/] });
      copyToClipboard(selector);
    },
    {
      withOutline: true,
    }
  );
}

function call(this: CommonAction, elem, options, effect) {
  effect?.(options);
}

function getTopmostElementInViewport(elements: NodeListOf<Element>) {
  let topmostElement: HTMLElement | null = null;
  let highestPosition = Infinity;

  for (const elem of elements) {
    const rect = elem.getBoundingClientRect();

    if (rect.top < window.innerHeight && rect.bottom > 0) {
      if (rect.top < highestPosition) {
        highestPosition = rect.top;
        topmostElement = elem as HTMLElement;
      }
    }
  }

  return topmostElement;
}
