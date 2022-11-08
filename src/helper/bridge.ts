import { getHtml } from "./iframe"
import { IFRAME_ID } from "../common/const"
import { NOTICE_TARGET } from "../common/enum"
import { PageMsg } from "../common/types"
import { noticeBg, noticeIframe } from './event';
import $ = require('jquery')

export function createBridge() {
  const callbacks = {}
  const registerFuncs = {}
  let cbId = 0

  const bridge = {
    inited: false,
    ready() {
      if (bridge.inited) {
        return Promise.resolve()
      } else {
        return new Promise(resolve => {
          $('html').append(getHtml());
          const $iframe = $(`#${IFRAME_ID}`);
          $iframe.on('load', () => {
            bridge.inited = true;
            resolve(null);
          });
        });
      }
    },
    async invoke(action, data, callback, target: NOTICE_TARGET = NOTICE_TARGET.BACKGROUND) {
      await bridge.ready()
      cbId = cbId + 1;
      callbacks[cbId] = callback;

      const msg: PageMsg = {
        action,
        ext_from: 'content',
        data,
        callbackId: cbId
      }
      if (target === NOTICE_TARGET.BACKGROUND) {
        noticeBg(msg)
      } else {
        noticeIframe(msg)
      }
    },

    receiveMessage(msg) {
      const { action, data, callbackId, responstId } = msg;

      if (callbackId) {
        if (callbacks[callbackId]) {
          callbacks[callbackId](data);
          callbacks[callbackId] = null;
        }
      } else if (action) {
        if (registerFuncs[action]) {
          let ret = {};
          let flag = false;

          registerFuncs[action].forEach(callback => {
            callback(data, function (r) {
              flag = true;
              ret = Object.assign(ret, r);
            });
          });

          if (flag) {
            noticeBg({
              responstId: responstId,
              ret: ret
            });
          }
        }
      }
    },

    register: function (action, callback) {
      if (!registerFuncs[action]) {
        registerFuncs[action] = [];
      }
      registerFuncs[action].push(callback);
    }
  }

  return bridge;
}

export const appBridge = createBridge()
