import $ = require('jquery')
import keyboardJS = require('keyboardjs')
import axios from 'axios'
import getCssSelector from 'css-selector-generator';
import { PageMsg } from '../common/types';

let isSetup, stop;

console.log($)

const outlineCls = 'ext-hp-ms-over';
const startOutlineEvt = 'ext-hp-startoutline';
const stopOutlineEvt = 'ext-hp-clearoutline';

function insertCss() {
  const css = document.createElement("style");

  css.type = "text/css";
  css.innerHTML = `.${outlineCls} {outline: 2px dotted #ccc}`;
  document.body.appendChild(css);
}

function start() {
  function listenMouseout(event) {
    $(event.target).removeClass(outlineCls);
  }
  $(document).on('mouseout', listenMouseout);

  function listenMouseover(event) {
    $(event.target).addClass(outlineCls);
  }

  $(document).on('mouseover', listenMouseover);

  function stop() {
    $(document).off('mouseover', listenMouseover);
    $(document).off('mouseout', listenMouseout);
    keyboardJS.bind('up');
  }

  keyboardJS.bind('up', (event) => {
    event.preventDefault()
    const $p = $(`.${outlineCls}`).parent()

    if ($p.length) {
      $(`.${outlineCls}`).removeClass(outlineCls)
      $p.addClass(outlineCls)
    }
  })

  return stop;
}

function clear() {
  $(`.${outlineCls}`).removeClass(outlineCls);
}

let outlinedCallback
function startOutline(callback) {
  outlinedCallback = callback
  stop && stop();
  stop = start();
}

function stopOutline() {
  outlinedCallback = null
  stop && stop();
  clear();
}

function setup() {
  if (!isSetup) {
    insertCss();

    $(document).on(startOutlineEvt, startOutline);
    $(document).on(stopOutlineEvt, stopOutline);

    $(document).on('click', function (event) {
      const $target = $(event.target).closest(`.${outlineCls}`)

      if ($target.length) {
        event.stopPropagation();
        event.preventDefault();
        if (outlinedCallback) {
          const keep = outlinedCallback($target[0], event);

          if (!keep) {
            stopOutline();
          }
        } else {
          stopOutline();
        }

        return false;
      }
    });

    console.log('extension helper inited');
    isSetup = true
  }
}

function getOutlinedElem() {
  return $(`.${outlineCls}`).get(0);
}

let actionCache = {
  $elem: null,
  subActions: null
};

function resetActionCache() {
  actionCache = {
    $elem: null,
    subActions: null
  };
}

export function exec(fn) {
  setup()
  startOutline(fn)
}

function enterReadMode(elem, record: boolean = true) {
  const $elem = $(elem)

  actionCache.$elem = $elem;
  hideSiblings($elem);

  elem.scrollIntoView();

  if (record) {
    recordAction(elem, 'readMode')
  }
}

export function readMode() {
  exec((elem, event) => {
    enterReadMode(elem)
  })
}

function getAction(elem: HTMLElement, actionName: string) {
  const selector = getCssSelector(elem, { blacklist: [/ext-hp/]})

  return `${actionName}@${selector}`
}

function recordAction(elem: HTMLElement, actionName) {
  const action = getAction(elem, actionName)

  appBridge.invoke('recordAction', {
    content: action, url: window.location.href, domain: window.location.host
  }, resp => {
    console.log("recordAction -> resp", resp)
  });
}

export function killElement() {
  exec((elem, event) => {
    elem.remove()
    recordAction(elem, 'killElement')
    if (event.metaKey) {
      requestAnimationFrame(killElement)
    }
  })
}

function hideSiblings($el) {
  if ($el && $el.length) {
    $el.siblings().not('#steward-main,#wordcard-main').css({
      visibility: 'hidden',
      opacity: 0
    }).addClass('s-a-rm-hn');
    hideSiblings($el.parent())
  } else {
    console.log('Enter reading mode');
    keyboardJS.bind('esc', function showNode() {
      $('.s-a-rm-hn').css({
        visibility: 'visible',
        opacity: 1
      }).removeClass('s-a-rm-hn');
      console.log('Exit reading mode');
      execSubActions(actionCache.$elem, actionCache.subActions, 'leave');
      resetActionCache();
      keyboardJS.unbind('esc', showNode);
    });
  }
}

function execSubActions($elem, action, type) {

}

export function highlightEnglishSyntax() {
  setup()
  startOutline(elem => {
    const $elem = $(elem)

    if ($elem.length) {
      const text = $elem[0].innerText;
      if (text) {
        appBridge.invoke('highlightEnglishSyntax', {
          text
        }, resp => {
          if (resp) {
            $elem.html(resp);
          }
        });
      }
    }
  })
}

function notifyBackground(msg, callback) {
  chrome.runtime.sendMessage(msg, resp => {
    callback(resp)
  });
}

function openOutline() {
  exec(() => true)
}

function getHtml() {
  const popupurl = chrome.extension.getURL('helper.html');
  const html = `
      <div id="steward-helper" class="steward-helper">
          <iframe style="display:none;" id="steward-helper-iframe" src="${popupurl}" name="steward-box" width="530" height="480" frameborder="0"></iframe>
      </div>
  `;

  return html;
}

// should refactor
const IFRAME_ID = 'steward-helper-iframe'

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
            resolve();
          });
        });
      }
    },
    async invoke(action, data, callback) {
      await bridge.ready()
      cbId = cbId + 1;
      callbacks[cbId] = callback;

      const msg: PageMsg = {
        action,
        ext_from: 'content',
        data,
        callbackId: cbId
      }
      noticeBg(msg)
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

window.addEventListener('message', event => {
  const { action, callbackId } = event.data;

  if (callbackId) {
    appBridge.receiveMessage(event.data);
  } else {
    console.log("action", action)
  }
});

export function noticeBg(msg) {
  chrome.runtime.sendMessage(msg, resp => {
    console.log(resp);
  });
}

export function exceAutomation(content) {
  console.log("exceAutomation -> content", content)
  debugger
  const [ action, selector ] = content.split('@')
  const elem = document.querySelector(selector)

  if (elem) {
    enterReadMode(elem, false)
  }
}

declare global {
  interface Window { exceAutomation: any; }
}

window.exceAutomation = exceAutomation

export default function (req) {
  const { data, action } = req

  if (action === 'dom.outline') {
    openOutline()

    return Promise.resolve({})
  } else {
    return Promise.resolve({})
  }
}