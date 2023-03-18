## Version
v0.1.0

## Language Overview
This language is used to define automation scripts that can be used to perform automated operations in a web browser, such as opening a webpage, clicking, inputting text, and more, in order to improve browsing experience and efficiency.

## Language Rules
The language consists of the following parts:
1. Comments, which support single-line and inline comments starting with `#`.
2. `automation` definition blocks:
```ruby
automation for "{url pattern}" on "{stage: immediate | load | delay}"
# Here are the specific statements
end
```

3. `statement` Statements
Statements are written inside an `automation` block and can be divided into the following three categories:
- Assignment statements
  - The format is: `set var = {value | variable | listen expression | get expression}`

- Shortcut statements
  - `open` statement: `open "{url}" as "{url pattern}"`, used to open the `url`, and only creates a new tab if the page is not already present in the `url pattern` set
  - `active` statement: `active`, used to select the current tab
  - `wait` statement: `wait {number}`, used for waiting between two statements, in seconds
  - `close` statement: `close`, closes the current page
  - `emit` statement: `emit "{eventName}" with (var1=1, var2=othervar)`, used to send a global event `eventName` to the browser
  - `listen` statement: `listen "{eventName}" on "CssSelector | global"`, listens for events from the global or page scope, e.g., `global` | `body` | `.cls`

- Execution statements
  - The format is: `apply "{actionName}" with (var1=1, var2=othervar, var=false, ...) on "CssSelector"`
  - The `apply` statement can execute all built-in `action`s, and essentially, shortcut statements can be rewritten by `apply` statements.

## Example
- Weibo Read-Mode
  ```ruby
  automation for "https://weibo.com/*" on "load"
    apply "readMode" with (excludes=".Frame_wrap_16as0")  on "#homeWrap"
  end
  ```