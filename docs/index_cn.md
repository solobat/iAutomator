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

| 操作名称 | 操作文档 |
| :--- | :--- |
| 选中当前页面 | [`active`](https://types.ihelpers.xyz/modules/Active.html) |
| 高亮英文语法 | [`highlightEnglishSyntax`](https://types.ihelpers.xyz/modules/HighlightEnglishSyntax.html) |
| 移除元素 | [`killElement`](https://types.ihelpers.xyz/modules/KillElement.html) |
| 阅读模式 | [`readMode`](https://types.ihelpers.xyz/modules/ReadMode.html) |
| 全屏模式 | [`fullScreen`](https://types.ihelpers.xyz/modules/FullScreen.html) |
| 代码块复制 | [`codeCopy`](https://types.ihelpers.xyz/modules/CodeCopy.html) |
| 元素跳转 | [`gotoElement`](https://types.ihelpers.xyz/modules/GotoElement.html) |
| 下载元素 | [`download`](https://types.ihelpers.xyz/modules/Download.html) |
| 自动滚动 | [`scroll`](https://types.ihelpers.xyz/modules/Scroll.html) |
| 等待 | [`wait`](https://types.ihelpers.xyz/modules/Wait.html) |
| 页面跳转 | [`openPage`](https://types.ihelpers.xyz/modules/OpenPage.html) |
| 允许复制 | [`allowCopying`](https://types.ihelpers.xyz/modules/AllowCopying.html) |
| 设置值 | [`setValue`](https://types.ihelpers.xyz/modules/SetValue.html) |
| 发送事件 | [`event`](https://types.ihelpers.xyz/modules/Event.html) |
| 页面重定向 | [`redirect`](https://types.ihelpers.xyz/modules/Redirect.html) |
| 滚动条记忆 | [`scrollbar`](https://types.ihelpers.xyz/modules/Scrollbar.html) |
| 元素锚点化 | [`hashElement`](https://types.ihelpers.xyz/modules/HashElement.html) |
| 单击元素 | [`click`](https://types.ihelpers.xyz/modules/Click.html) |
| 笔记 | [`note`](https://types.ihelpers.xyz/modules/Note.html) |
| 更改标题 | [`title`](https://types.ihelpers.xyz/modules/Title.html) |
| 更改属性 | [`attributes`](https://types.ihelpers.xyz/modules/Attributes.html) |
| 焦点 | [`focus`](https://types.ihelpers.xyz/modules/Focus.html) |
| 保护页面 | [`protect`](https://types.ihelpers.xyz/modules/Protect.html) |
| 画中画模式 | [`pictureInPicture`](https://types.ihelpers.xyz/modules/PictureInPicture.html) |
| 暗黑模式 | [`darkMode`](https://types.ihelpers.xyz/modules/DarkMode.html) |
| 大纲 | [`outline`](https://types.ihelpers.xyz/modules/Outline.html) |
| 按钮 | [`button`](https://types.ihelpers.xyz/modules/Button.html) |
| 书签 | [`bookmark`](https://types.ihelpers.xyz/modules/Bookmark.html) |
| 刷新 | [`reload`](https://types.ihelpers.xyz/modules/Reload.html) |
| 关闭当前页面 | [`closePage`](https://types.ihelpers.xyz/modules/ClosePage.html) |
| 单标签 | [`singleTab`](https://types.ihelpers.xyz/modules/)

## 文档
- [IScript 脚本文档](https://docs.ihelpers.xyz/)
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
