<h1 align="center">iHelpers</h1>
<p align="left">iHelpers is a Chrome extension that provides users with built-in shortcuts such as reading mode, night mode, page outlines, and basic operations like clicking, inputting, event listening and emitting, and more. In addition to supporting custom functions through script mode, iHelpers also allows for instruction configuration through its user interface. Whether you are looking to increase productivity or seeking more convenience while browsing the web, iHelpers is a very practical tool.</p>
<p align="center">
   <a href="https://github.com/solobat/iHelpers/releases"><img src="https://img.shields.io/badge/lastest_version-1.8.0-blue.svg"></a>
   <a target="_blank" href="https://chrome.google.com/webstore/detail/ihelpers/hcnekoladldejmeindnhpjkfhjadcick"><img src="https://img.shields.io/badge/download-_chrome_webstore-brightgreen.svg"></a>
</p>

---

[中文](./index_cn.md)

## Install

- [Chrome Web Store](https://chrome.google.com/webstore/detail/ihelpers/hcnekoladldejmeindnhpjkfhjadcick)

## Features

### Table of Built-in Actions in iHelpers
#### Reload

Reload the current page with specified interval, start condition and stop condition.

| Argument | Description | Type | Default Value | Example |
| --- | --- | --- | --- | --- |
| interval | The interval at which to reload. | number | 5 | 10 |
| start | Start reloading when the element exists. | string | "" | ".my-class" |
| stop | Stop reloading when the element exists. | string | "" | "#my-id" |

---

#### Read Mode

Enable read mode on the current page.

| Argument | Description | Type | Default Value | Example |
| --- | --- | --- | --- | --- |
| metaKey | Whether to enable read mode using meta key (e.g. Ctrl key on Windows or Command key on Mac). | boolean | false | true |

---

#### Dark Mode

Change the current page to dark mode.

| Argument | Description | Type | Default Value | Example |
| --- | --- | --- | --- | --- |
| long | Longitude | number | | 121.4737 |
| lat | Latitude | number | | 31.2304 |
| system | Follow the system theme for applying the dark mode | boolean | false | true |

---

#### Bookmark

Bookmark target items on the current page.

| Argument | Description | Type | Default Value | Example |
| --- | --- | --- | --- | --- |
| item | CSS-Selector of the target items. | string | | ".my-class" |
| refresh | Refresh type: auto | manual | string | "manual" | "manual" |
| notify | Should notify on the title? | boolean | true | true |

---

#### Code Copy

Copy code from the current page.

| Argument | Description | Type | Default Value | Example |
| --- | --- | --- | --- | --- |
| inpre | The child of the `<pre>` tag to copy. | boolean | false | true |
| pre | The `<pre>` tag to copy. | boolean | false | true |
| rm | Elements to remove. | string | "" | ".my-class" |
| pos | Position of the copy button. | string | "tl" | "tr" |

#### Click

Trigger a click on an element.

---

#### Focus

Set focus on the specified element.

| Argument | Description | Type | Default Value | Example |
| --- | --- | --- | --- | --- |
| blur | Whether to blur the element. | boolean | false | true |

---

#### Note

Create a note or comment.

| Argument | Description | Type | Default Value | Example |
| --- | --- | --- | --- | --- |
| value | Content of the note. | string | "" | "This is a note." |
| isComment | Save note as comment. | boolean | false | true |

---

#### Set title

Set the title of the page.

| Argument | Description | Type | Example |
| --- | --- | --- | --- |
| title | Text of the title. | string | "New Title" |

---

#### Attributes

Modify attributes of an element.

| Argument | Description | Type | Example |
| --- | --- | --- | --- |
| name | Name of the attribute. | string | "class" |
| value | Value of the attribute. | string | "my-class" |

---

#### Scrollbar position

Set the position of the scrollbar.

| Argument | Description | Type | Example |
| --- | --- | --- | --- |
| delay | Delay before scrolling starts (in seconds).| number | 1 |

#### Event

Listen or emit an event.

| Argument | Description | Type | Default Value | Example |
| --- | --- | --- | --- | --- |
| events | Name of the event. | string | | "click" |
| selector | CSS selector of the target. | string | | ".my-class" |
| type | Type of action: listen or emit. | string | "listen" | "emit" |

---

#### Set value

Set value of an input element.

| Argument | Description | Type | Default Value | Example |
| --- | --- | --- | --- | --- |
| value | Value to be set. | string | "" | "Hello World." |

---

#### Active

Activate current page.

---

#### Scroll

Scroll the page.

| Argument | Description | Type | Default Value | Example |
| --- | --- | --- | --- | --- |
| speed | Speed of scrolling with unit px/s. | number | 20 | 30 |

---

#### Button

Create a customizable button.

| Argument | Description | Type | Default Value | Example |
| --- | --- | --- | --- | --- |
| type | Button type. Available types are: {top|toggle|shortcut|translate}. | string | "" | "toggle" |
| item | CSS selector of the items. | string | "" | ".my-class" |
| pos | Position of the button. | string | "" | "tr" |
| mh | Min-height of the button. | string | 35 | 50 |

#### Outline

Outline the main headings of the current page.

|  Name  |         Description          | Type |  Default  |
|:------:|:---------------------------:|:----:|:---------:|
|   -    |             -               |  -   |     -     |

#### Redirect

Redirect from the current page to another page.

|      Name       |             Description             |   Type   |      Default      |
|:---------------:|:-----------------------------------:|:--------:|:-----------------:|
|      from       |         Path pattern of the from page         |  string  |         -         |
|        to       |      path pattern of the to page      |  string  |         -         |
|       host      |                  Hostname of the to page                   |  string  |         -         |
|      query      | New query parameters of the URL as a string |  string  |         -         |
|     qformat     |      Format of the query parameters: 'arr' or 'default'      |  string  |         -         |

#### Allow Copying

Enable copying of text and other content.

|  Name  |         Description          | Type |  Default  |
|:------:|:---------------------------:|:----:|:---------:|
|   -    |             -               |  -   |     -     |

#### Zen Mode

Hide all elements on the page and leave only a defined text with a background.

|    Name   |  Description  | Type  |  Default  |
|:---------:|:-------------:|:----:|:--------:|
|   word    | Text to be displayed | string |   Zen    |
|   delay   | Delay in seconds before displaying the page | string |  0 (never display) |
|  bgcolor  | Background color | string | #35363a |
|   color   | Font color | string | #ffffff |

#### Start PIP Mode

Start the Picture in Picture mode, which lets you watch video in a floating window on top of other windows.

|  Name  |         Description          | Type |  Default  |
|:------:|:---------------------------:|:----:|:---------:|
|   -    |             -               |  -   |     -     |

#### Hash Element

Add an anchor for one or more elements on the page.

|  Name  |         Description          | Type |  Default  |
|:------:|:---------------------------:|:----:|:---------:|
|   -    |             -               |  -   |     -     |

#### Time Update

Add a time tag for a HTML5 video on the page.

|  Name  |         Description          | Type |  Default  |
|:------:|:---------------------------:|:----:|:---------:|
|   -    |             -               |  -   |     -     |

#### Goto Element

Automatically navigate to a target element on the page.

|   Name  |          Description         |    Type    |      Default      |
|:-------:|:---------------------------:|:----------:|:-----------------:|
|   auto  | Automatically navigate to target element |  boolean   |        false       |
|    to   |       Target element's CSS selector |   string   |          -         |
|   order | Order to navigate through the elements |   string   | asc (ascending) / desc (descending) |
|  handle | Handle function for target element |   string   |   -    |

#### Single Tab

Open a single tab for the specified URL.

|  Name  |         Description          | Type |  Default  |
|:------:|:---------------------------:|:----:|:---------:|
|  path  | Path |  string  |     -     |

#### Wait

Wait for a specified amount of time (in seconds).

|  Name  |         Description          |    Type   | Default |
|:-------:|:---------------------------:|:---------:|:-------:|
|  time   | The amount of time to wait, measured in seconds |  number  |    1    |

#### Close Page

Close the current tab or window.

|  Name  |         Description          | Type |  Default  |
|:------:|:---------------------------:|:----:|:---------:|
|   -    |             -               |  -   |     -     |



## Docs

- [IScript Documents](./IScript_en.md) / [中文](./IScript.md)
- [Types Documents](https://types.ihelpers.xyz/)
- [Youtube Video](https://www.youtube.com/watch?v=L7DpcRtkq2U)

## Development

Please start with the dev branch

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
