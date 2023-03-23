<h1 align="center">iHelpers</h1>
<p align="left">iHelpers 是一个 Chrome 扩展程序，为用户提供了内置的快捷方式，例如阅读模式、夜间模式、页面概述，以及一些基本操作如点击、输入、事件监听和派发等等。除了通过 IScript 支持脚本模式的自动化之外，iHelpers 还允许通过其界面进行指令配置。无论你是想提高生产力还是在浏览 Web 时寻求更多便利，iHelpers 都是一个非常实用的工具。
</p>
<p align="center">
   <a href="https://github.com/solobat/iHelpers/releases"><img src="https://img.shields.io/badge/lastest_version-1.8.0-blue.svg"></a>
   <a target="_blank" href="https://chrome.google.com/webstore/detail/ihelpers/hcnekoladldejmeindnhpjkfhjadcick"><img src="https://img.shields.io/badge/download-_chrome_webstore-brightgreen.svg"></a>
</p>

---

## 安装

- [Chrome Web Store](https://chrome.google.com/webstore/detail/ihelpers/hcnekoladldejmeindnhpjkfhjadcick)

## 功能类型
### iHelpers 内置操作列表

#### Reload

在指定的间隔时间内重新加载当前页面，并在指定的启动条件和停止条件下执行。

| 参数 | 描述 | 类型 | 默认值 | 示例 |
| --- | --- | --- | --- | --- |
| interval | 重新加载的时间间隔。 | number | 5 | 10 |
| start | 当存在指定元素时开始重新加载。 | string | "" | ".my-class" |
| stop | 当存在指定元素时停止重新加载。 | string | "" | "#my-id" |

---

#### Read Mode

在当前页面启用阅读模式。

| 参数 | 描述 | 类型 | 默认值 | 示例 |
| --- | --- | --- | --- | --- |
| metaKey | 是否使用 meta 键（例如 Windows 上的 Ctrl 键或 Mac 上的 Command 键）启用阅读模式。 | boolean | false | true |

---

#### Dark Mode

将当前页面切换为暗模式。

| 参数 | 描述 | 类型 | 默认值 | 示例 |
| --- | --- | --- | --- | --- |
| long | 经度。 | number | | 121.4737 |
| lat | 纬度。 | number | | 31.2304 |
| system | 是否跟随系统主题应用暗模式。 | boolean | false | true |

---

#### Bookmark

在当前页面上标记目标项目。

| 参数 | 描述 | 类型 | 默认值 | 示例 |
| --- | --- | --- | --- | --- |
| item | 目标项目的 CSS 选择器。 | string | | ".my-class" |
| refresh | 刷新类型：auto（自动）| manual（手动）| string | "manual" | "manual" |
| notify | 是否在标题上通知。 | boolean | true | true |

---

#### Code Copy

从当前页面复制代码。

| 参数 | 描述 | 类型 | 默认值 | 示例 |
| --- | --- | --- | --- | --- |
| inpre | 复制 `<pre>` 标签的子元素。 | boolean | false | true |
| pre | 复制 `<pre>` 标签。 | boolean | false | true |
| rm | 要删除的元素。 | string | "" | ".my-class" |
| pos | 复制按钮的位置。 | string | "tl" | "tr" |

#### Click

触发一个元素的点击事件。

---

#### Focus

将焦点设置到指定的元素上。

| 参数 | 描述 | 类型 | 默认值 | 示例 |
| --- | --- | --- | --- | --- |
| blur | 是否在设置焦点后将焦点移开。 | boolean | false | true |

---

#### Note

创建一条注释或评论。

| 参数 | 描述 | 类型 | 默认值 | 示例 |
| --- | --- | --- | --- | --- |
| value | 注释内容。 | string | "" | "这是一条注释。" |
| isComment | 是否将注释保存为评论。 | boolean | false | true |

---

#### Set title

设置页面的标题。

| 参数 | 描述 | 类型 | 示例 |
| --- | --- | --- | --- |
| title | 标题文本。 | string | "新标题" |

---

#### Attributes

修改元素的属性。

| 参数 | 描述 | 类型 | 示例 |
| --- | --- | --- | --- |
| name | 属性名称。 | string | "class" |
| value | 属性的值。 | string | "my-class" |

---

#### Scrollbar position

设置滚动条的位置。

| 参数 | 描述 | 类型 | 示例 |
| --- | --- | --- | --- |
| delay | 滚动开始前的延迟时间（秒）。| number | 1 |

#### Event

监听或触发一个事件。

| 参数 | 描述 | 类型 | 默认值 | 示例 |
| --- | --- | --- | --- | --- |
| events | 事件的名称。 | string | | "click" |
| selector | 目标元素的 CSS 选择器。 | string | | ".my-class" |
| type | 动作的类型：监听或触发。 | string | "listen" | "emit" |

#### 设置值

设置输入元素的值。

| 参数 | 描述 | 类型 | 默认值 | 示例 |
| --- | --- | --- | --- | --- |
| value | 要设置的值。 | string | "" | "Hello World." |

---

#### 激活

激活当前页面。

---

#### 滚动

滚动页面。

| 参数 | 描述 | 类型 | 默认值 | 示例 |
| --- | --- | --- | --- | --- |
| speed | 滚动速度，以 px/s 为单位。 | number | 20 | 30 |

---

#### 按钮

创建一个可自定义的按钮。

| 参数 | 描述 | 类型 | 默认值 | 示例 |
| --- | --- | --- | --- | --- |
| type | 按钮类型。可用类型有：{top/toggle/shortcut/translate}。 | string | "" | "toggle" |
| item | 项目的 CSS 选择器。 | string | "" | ".my-class" |
| pos | 按钮的位置。 | string | "" | "tr" |
| mh | 按钮的最小高度。 | string | 35 | 50 |

#### 大纲

勾画出当前页面的主要标题。

|  名称  |         描述          | 类型 |  默认值  |
|:------:|:---------------------------:|:----:|:---------:|
|   -    |             -               |  -   |     -     |

#### Redirect

重定向当前页面到另一个页面。

| 名称 | 描述 | 类型 | 默认值 |
| --- | --- | --- | --- |
| from | 要重定向的页面路径模式 | string | - |
| to | 重定向后的页面路径模式 | string | - |
| host | 要重定向到的页面的主机名 | string | - |
| query | 新 URL 的查询参数字符串 | string | - |
| qformat | 查询参数格式，可以是 'arr' 或 'default' | string | - |

#### Allow Copying

启用复制文本和其他内容。

| 名称 | 描述 | 类型 | 默认值 |
| --- | --- | --- | --- |
| - | - | - | - |

#### Zen Mode

隐藏页面上的所有元素，只留下一个定义的文本和背景。

| 名称 | 描述 | 类型 | 默认值 |
| --- | --- | --- | --- |
| word | 要显示的文本 | string | Zen |
| delay | 显示页面前的延迟时间（秒）| string | 0（立即显示）|
| bgcolor | 背景颜色 | string | #35363a |
| color | 字体颜色 | string | #ffffff |

#### Start PIP Mode

启动画中画模式，允许您在其他窗口上方浮动地观看视频。

| 名称 | 描述 | 类型 | 默认值 |
| --- | --- | --- | --- |
| - | - | - | - |

#### Hash Element

为页面上的一个或多个元素添加锚点。

| 名称 | 描述 | 类型 | 默认值 |
| --- | --- | --- | --- |
| - | - | - | - |

#### Time Update

为 HTML5 视频添加时间标签。

| 名称 | 描述 | 类型 | 默认值 |
| --- | --- | --- | --- |
| - | - | - | - |

#### Goto Element

自动导航到页面上的目标元素。

| 名称 | 描述 | 类型 | 默认值 |
| --- | --- | --- | --- |
| auto | 是否自动导航到目标元素 | boolean | false |
| to | 目标元素的 CSS 选择器 | string | - |
| order | 导航目标元素的顺序，可以是升序（'asc'）或降序（'desc'）| string | 升序 |
| handle | 目标元素的处理函数 | string | - |

#### Single Tab

为指定的 URL 打开一个标签页。

| 名称 | 描述 | 类型 | 默认值 |
| --- | --- | --- | --- |
| path | 路径 | string | - |

#### Wait

等待指定时间

|  名称  |         描述          |    类型   | 默认值 |
|:-------:|:---------------------------:|:---------:|:-------:|
|  time   | 等待的时间，以秒为单位 |  number  |    1    |

#### Close Page

关闭当前页面

|  名称  |         描述          | 类型 |  默认值  |
|:------:|:---------------------------:|:----:|:---------:|
|   -    |             -               |  -   |     -     |

## 文档
- [IScript 脚本文档](./IScript.md)
- [类型文档](https://types.ihelpers.xyz/)
- [Youtube 视频](https://www.youtube.com/watch?v=L7DpcRtkq2U)

## 开发

请从 `dev` 分支开始

```
# node >= v16.13
`yarn`

# dev
yarn dev

# build
yarn build
```

## License:

[![license-badge]][license-link]

<!-- Link -->

[version-badge]: https://img.shields.io/badge/lastest_version-1.6.0-blue.svg
[version-link]: https://github.com/solobat/iHelpers
[chrome-badge]: https://img.shields.io/badge/download-_chrome_webstore-brightgreen.svg
[offline-badge]: https://img.shields.io/badge/download-_crx-brightgreen.svg
[license-badge]: https://img.shields.io/github/license/mashape/apistatus.svg
[license-link]: https://opensource.org/licenses/MIT
