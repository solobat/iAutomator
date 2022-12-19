import { PAGE_ACTIONS } from "@src/common/const";
import { show } from "@src/utils/log";
import { noticeBg } from "./event";

let connected = false;
const TickDuration = 10000;

function tick(callback?: () => void) {
  return window.setTimeout(() => {
    callback && callback();
    ping();
  }, TickDuration);
}

function ping() {
  noticeBg({ action: PAGE_ACTIONS.PING }, (res) => {
    if (res.data) {
      tick(() => {
        if (!connected) {
          updateConnected(true);
        }
      });
    } else {
      updateConnected(false);
    }
  });
}

function updateConnected(newStatus: boolean) {
  connected = newStatus;
  notify();
}

function notify() {
  show("heartheat status changed: " + connected ? "connected" : "disconnected");
}

function connect() {
  noticeBg(
    {
      action: PAGE_ACTIONS.CONNECT,
    },
    (res) => {
      if (res.data) {
        updateConnected(true);
        ping();
      } else {
        show("not the active page, so stop connect");
      }
    }
  );
}

function start() {
  if (!connected) {
    connect();
  }
}

export const Heartheat = {
  start,
};
