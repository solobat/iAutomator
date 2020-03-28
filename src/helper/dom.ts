import $ = require('jquery')
import keyboardJS = require('keyboardjs')
import getCssSelector from 'css-selector-generator';
import { noticeBg } from './event';
import { PAGE_ACTIONS } from '../common/const';
import Base, { DomHelper } from '../buildin/Base'
import { appBridge } from './bridge'
import Download from '../buildin/Download'
import FullScreen from '../buildin/FullScreen'
import HashElement from '../buildin/HashElement'
import HighlightEnglishSyntax from '../buildin/HighlightEnglishSyntax'
import KillElement from '../buildin/KillElement'
import ReadMode from '../buildin/ReadMode'

let isSetup, stop, cssInserted;

const outlineCls = 'ext-hp-ms-over';
const startOutlineEvt = 'ext-hp-startoutline';
const stopOutlineEvt = 'ext-hp-clearoutline';

function insertCss() {
  if (!cssInserted) {
    const css = document.createElement("style");
  
    css.type = "text/css";
    css.innerHTML = `
      .${outlineCls} {outline: 2px dotted #ccc}
      ${getStyles()}
    `;
    document.body.appendChild(css);
    cssInserted = true;
  }
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

function recordAction(actionName, elem?: HTMLElement) {
  const action = getAction(actionName, elem)

  appBridge.invoke(PAGE_ACTIONS.RECORD, {
    content: action, url: window.location.href, domain: window.location.host
  }, resp => {
    console.log("recordAction -> resp", resp)
  });
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
    helper.insertCss();

    $(document).on(startOutlineEvt, startOutline);
    $(document).on(stopOutlineEvt, stopOutline);

    document.addEventListener('click', function (event) {
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
    }, true)

    keyboardJS.bind('esc', () => {
      stopOutline()
    })

    console.log('extension helper inited');
    isSetup = true
  }
}

function getOutlinedElem() {
  return $(`.${outlineCls}`).get(0);
}

export function exec(fn) {
  setup()
  startOutline(fn)
}

function getAction(actionName: string, elem?: HTMLElement) {
  if (elem) {
    const selector = getCssSelector(elem, { blacklist: [/ext-hp/]})
  
    return `${actionName}@${selector}`
  } else {
    return `${actionName}@body`
  }
}

function openOutline() {
  exec(() => true)
}

window.addEventListener('message', event => {
  const { action, callbackId } = event.data;

  if (callbackId) {
    appBridge.receiveMessage(event.data);
  } else {
    console.log("action", action)
  }
});

export function exceAutomation(content, times = 0) {
  const [ action, selector ] = content.split('@')
  const elem = document.querySelector(selector)

  function tryAgain() {
    if (times < 5) {
      setTimeout(() => {
        exceAutomation(content, times + 1)
      }, 1000)
    }
  }
  function exec(instance) {
    instance.autoMationFn = () => {
      console.log('TCL: sh --> autoMationFn')
      times = 0
      tryAgain()
    }
    instance.run(elem, {
      silent: true
    })
  }

  if (elem) {
    const instance = findAction(action)

    if (instance) {
      if (instance.shouldTryAgain) {
        const result = instance.run(elem, {
          silent: true
        })

        if (!result) {
          tryAgain()
        } else {
          exec(instance)
        }
      } else {
        exec(instance)
      }
    }
  } else {
    tryAgain()
  }
}

declare global {
  interface Window { exceAutomation: any; }
}

window.exceAutomation = exceAutomation

$(() => {
  noticeBg({
    action: PAGE_ACTIONS.AUTOMATIONS,
    data: { url: window.location.href }
  }, (result) => {
    if (result.data && result.data.length) {
      result.data.forEach(item => {
        exceAutomation(item.instructions)
      })
    }
  })
})

const helper: DomHelper = {
  actionCache: {
    $elem: null,
    subActions: null
  },

  exec(fn) {
    setup()
    startOutline(fn)
  },

  resetActionCache() {
    helper.actionCache = {
      $elem: null,
      subActions: null
    };
  },

  recordAction,

  insertCss,

  invoke: appBridge.invoke,

  actions: []
}

function install() {
  new Download(helper)
  new FullScreen(helper)
  new HashElement(helper)
  new HighlightEnglishSyntax(helper)
  new KillElement(helper)
  new ReadMode(helper)
}

install()

function findAction(name: string): Base | null {
  return helper.actions.find(item => item.name === name)
}

function getStyles() {
  return helper.actions.reduce((memo, item) => {
    if (item.style) {
      memo += item.style
    }

    return memo
  }, '')
}

export function startAction(actionName: string) {
  const action = findAction(actionName)

  if (action) {
    action.start()
  }
}

export default function (req) {
  const { data, action } = req

  if (action === 'dom.outline') {
    openOutline()

    return Promise.resolve({})
  } else {
    return Promise.resolve({})
  }
}