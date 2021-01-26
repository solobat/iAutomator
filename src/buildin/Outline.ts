import Base, { ExecOptions, defaultExecOptions } from './base'
import { BUILDIN_ACTIONS } from '../common/const';
import 'is-in-viewport';
import $ = require('jquery')

interface OutlineNode {
  name: string,
  level: number,
  index?: number,
  parent: OutlineNode | null,
  children: OutlineNode[]
}

export default class Outline extends Base {
  name = BUILDIN_ACTIONS.OUTLINE
  cls = 'ext-hp-outline'
  style = `
    #ext-hp-outline {
      background-color: #fafafa;
      border: 1px solid rgba(0, 0, 0, .07);
      -webkit-box-shadow: 0 6px 12px rgba(0, 0, 0, .175);
      box-shadow: 0 6px 12px rgba(0, 0, 0, .175);
      background-clip: padding-box;
      padding: 5px 10px;
      position: fixed;
      /* background-color: rgba(255,255,255,0.98); */
      font-size: 12px;
      white-space: nowrap;
      z-index: 999;
      cursor: pointer;
      text-align: right;
      border-radius: 5px;
      user-select: none;
    }

    #ext-hp-outline.tr {
      right: 50px;
      top: 68px;
    }

    #ext-hp-outline.tl {
      left: 50px;
      top: 68px;
      text-align: left;
    }

    #ext-hp-outline.bl {
      left: 50px;
      bottom: 68px;
      text-align: left;
    }

    #ext-hp-outline.br {
      right: 50px;
      bottom: 68px;
    }

    #ext-hp-outline .content {
      max-height: 210px;
      overflow-y: auto;
      overflow-x: hidden;
    }

    #ext-hp-outline ul {
      display: block;
      text-align: left;
      padding-right: 10px;
      padding-left: 10px;
      list-style-type: none;
    }

    #ext-hp-outline ul li a {
      line-height: 1.7;
      text-decoration: none;
      border-bottom: none;
      font-size: 14px;
      color: #364149;
      background: 0 0;
      text-overflow: ellipsis;
      overflow: hidden;
      white-space: nowrap;
      position: relative;
    }

    .ext-hp-outline-fold, .ext-hp-outline-fold-btn {
      position: relative;
      cursor: pointer;
      font-size: 20px;
      color: #333;
      line-height: 1;
    }
  `
  shouldRedo = true
  shouldRecord = true

  private headerElems = []

  start() {
    this.exec(document.body, {})
  }

  private getParent(node: any, level: number) {
    let pNode = node

    while(pNode.parent) {
      if (pNode.level < level) {
        return pNode
      } else {
        pNode = pNode.parent
      }
    }

    return pNode
  }

  private generateOutline(outlineScope) {
    const headerSels = 'h1,h2,h3,h4,h5,h6';
  
    const nodes = $.makeArray($(outlineScope).find(headerSels)) || [];
    const inViewPortIndexes = [];
    
    let parent: OutlineNode = {
      name: 'root',
      parent: null,
      children: [],
      level: 0
    };
    let root = parent

    this.headerElems = nodes
      .filter(elem => {
        return elem.innerText !== '';
      })

    this.headerElems.forEach((elem, index) => {
        const level = Number(elem.tagName[1]);
  
        if ($(elem).is(':in-viewport')) {
          inViewPortIndexes.push(index);
        }
  
        const item = {
          name: elem.innerText,
          level,
          index: index,
          parent: null,
          children: []
        };
        const newParent = this.getParent(parent, level)
        item.parent = newParent;
        newParent.children.push(item)
        parent = item
      });
  
    if (inViewPortIndexes.length) {
      // items[inViewPortIndexes.pop()].isCurrent = true;
    }
  
    return root;
  }

  private renderOutline(node: OutlineNode, options?: ExecOptions) {
    if (node.name === 'root') {
      const children = node.children.map(child => this.renderOutline(child))
      const pos = options.pos || 'tr'

      return `
<div id="${this.cls}" class="${pos}">
  ${pos.startsWith('t') ? `<div class="${this.cls}-fold">-</div>` : ''}
  <div class="content">
  ${children.length ? `<ul>${children.join('')}</ul>` : ''}
  </div>
  ${pos.startsWith('b') ? `<div class="${this.cls}-fold">-</div>` : ''}
</div>
      `
    } else {
      const children = node.children.map(child => this.renderOutline(child))

      return `
<li>
  <a href="javascript:;" class="ext-hp-link" data-index="${node.index}">${node.name}</a>
  ${children.length ? `<ul>${children.join('')}</ul>` : ''}
</li>
      `
    }
  }

  private createOutlineBtn(scope: any, options?: ExecOptions) {
    const pos = options.pos || 'tr'
    const html = `
<div id="${this.cls}" class="${pos}">
  <div class="${this.cls}-fold-btn">+</div>
</div>
`
    const $html = $(html)
    $('body').append($html)
    $('body').on('click', '.ext-hp-outline-fold-btn', () => {
      $html.remove();
      this.createOutline(scope, options);
    })
  }

  private toggle() {
    const $fold = $('.ext-hp-outline-fold')

    $fold.html($fold.text() === '-' ? '+' : '-')
    $('#ext-hp-outline .content > ul').toggle()
  }

  private createOutline(scope: any, options?: ExecOptions) {
    const elems = this.generateOutline(scope);
    const outline = this.renderOutline(elems, options);

    $('body').append($(outline))
    $('body').on('click', '#ext-hp-outline a', (elem) => {
      const index = $(elem.target).attr('data-index')

      this.headerElems[Number(index)].scrollIntoView();
      if (options.autoHide) {
        this.toggle();
      }
    })
    $('body').on('click', '.ext-hp-outline-fold', () => {
      this.toggle();
    })
  }

  exec(elem, options?: ExecOptions) {
    this.helper.insertCss()
    if (!options.lazy) {
      this.createOutline(elem, options)
    } else {
      this.createOutlineBtn(elem, options)
    }

    this.recordIfNeeded(options)

    return true
  }
}