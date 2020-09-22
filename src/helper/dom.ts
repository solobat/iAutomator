import $ = require('jquery')
import keyboardJS from 'keyboardjs'
import getCssSelector from 'css-selector-generator';
import { noticeBg } from './event';
import { PAGE_ACTIONS } from '../common/const';
import Base, { DomHelper, ExecOptions } from '../buildin/Base'
import { appBridge } from './bridge'
import Download from '../buildin/Download'
import FullScreen from '../buildin/FullScreen'
import HashElement from '../buildin/HashElement'
import HighlightEnglishSyntax from '../buildin/HighlightEnglishSyntax'
import KillElement from '../buildin/KillElement'
import ReadMode from '../buildin/ReadMode'
import TimeUpdate from '../buildin/TimeUpdate'
import ClickElement from '../buildin/Click'
import CodeCopy from '../buildin/CodeCopy'
import GotoElement from '../buildin/GotoElement'
import PictureInPicture from '../buildin/PictureInPicture'
import ZenMode from '../buildin/ZenMode'
import { RunAt } from '../server/enum/Automation';
import Automation from '../server/model/Automation';

let isSetup, stop, cssInserted;

const outlineCls = 'ext-hp-ms-over';
const startOutlineEvt = 'ext-hp-startoutline';
const stopOutlineEvt = 'ext-hp-clearoutline';

function insertCss() {
  if (!cssInserted) {
    const css = document.createElement("style");
  
    css.type = "text/css";
    css.innerHTML = `
      @font-face {
        font-family: 'iconfont';  /* project id 1867097 */
        src: url('//at.alicdn.com/t/font_1867097_6yqhpbmlqwb.eot');
        src: url('//at.alicdn.com/t/font_1867097_6yqhpbmlqwb.eot?#iefix') format('embedded-opentype'),
        url('//at.alicdn.com/t/font_1867097_6yqhpbmlqwb.woff2') format('woff2'),
        url('//at.alicdn.com/t/font_1867097_6yqhpbmlqwb.woff') format('woff'),
        url('//at.alicdn.com/t/font_1867097_6yqhpbmlqwb.ttf') format('truetype'),
        url('//at.alicdn.com/t/font_1867097_6yqhpbmlqwb.svg#iconfont') format('svg');
      }
      .iconfont::after {
        font-family:"iconfont" !important;
        font-size:16px;font-style:normal;
        -webkit-font-smoothing: antialiased;
        -webkit-text-stroke-width: 0.2px;
        -moz-osx-font-smoothing: grayscale;
      }
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

function recordAction(actionName, elem?: HTMLElement, options?: ExecOptions) {
  const action = getAction(actionName, elem, options)

  appBridge.invoke(PAGE_ACTIONS.RECORD, {
    content: action, url: window.location.href, domain: window.location.host
  }, resp => {
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

function serializeOptions(options?: ExecOptions): string {
  if (options) {
    const str = Object.keys(options).map(key => {
      const val = options[key]

      if (val) {
        return [key, options[key]].join('!') 
      } else {
        return ''
      }
    }).join('^');

    return str ? `^${str}` : '';
  } else {
    return ''
  }
}

function getAction(actionName: string, elem?: HTMLElement, options?: ExecOptions) {
  const optStr = serializeOptions(options);

  if (elem) {
    const selector = getCssSelector(elem, { blacklist: [/ext-hp/]})

    return `${actionName}${optStr}@${selector}`
  } else {
    return `${actionName}${optStr}@body`
  }
}

function openOutline() {
  exec(() => true)
}

window.addEventListener('message', event => {
  const { action, callbackId } = event.data;

  if (callbackId) {
    appBridge.receiveMessage(event.data);
  }
});

function getExecOptions(modifiers = []) {
  const options = {
    silent: true
  }

  modifiers.forEach((item) => {
    const [key, ...value] = item.split('!');
    if (value.length) {
      if (value.length === 1) {
        try {
          options[key] = JSON.parse(value[0]);
        } catch (error) {
          options[key] = value[0];
        }
      } else {
        options[key] = value
      }
    } else {
      options[key] = true
    }
  })

  return options
}

export function exceAutomation(content, times = 0, runAt: RunAt) {
  const [ actionStr, selector ] = content.split('@')
  const [ action, ...modifiers ] = actionStr.split('^')
  const elem = document.querySelector(selector)

  function tryAgain() {
    if (times < 5) {
      const delay = runAt === RunAt.START ? 16 : 1000

      setTimeout(() => {
        exceAutomation(content, times + 1, runAt)
      }, delay)
    }
  }
  function exec(instance) {
    instance.autoMationFn = () => {
      times = 0
      tryAgain()
    }
    instance.run(elem, getExecOptions(modifiers))
  }

  if (elem) {
    const instance = findAction(action)

    if (instance) {
      exec(instance)
    }
  } else {
    tryAgain()
  }
}

declare global {
  interface Window { exceAutomation: any; }
}

window.exceAutomation = exceAutomation

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
  new TimeUpdate(helper)
  new ClickElement(helper)
  new CodeCopy(helper)
  new GotoElement(helper)
  new PictureInPicture(helper)
  new ZenMode(helper)
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

function startAutomations() {
  noticeBg({
    action: PAGE_ACTIONS.AUTOMATIONS,
    data: { url: window.location.href }
  }, (result) => {
    if (result.data && result.data.length) {
      const activeItems = result.data.filter(item => item.active)
      const immediateItems = activeItems.filter(item => item.runAt === RunAt.START)
      const readyItems = activeItems.filter(item => item.runAt === RunAt.END)

      execAutomations(immediateItems, RunAt.START)

      $(() => {
        execAutomations(readyItems, RunAt.END)
      })
    }
  })
}

function execAutomations(automations, runAt: RunAt) {
  automations.forEach(item => {
    exceAutomation(item.instructions, 0, runAt)
  })
}

startAutomations()