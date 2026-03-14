## 版本
v0.2.0（草案）

## 语言概述
该语言用于定义自动化脚本，可以通过该脚本来创建浏览器的自动化操作，例如打开网页、点击、输入文字等，从而提高浏览的体验与效率。

## 语言规则
该语言由以下几个部分组成：

1. **注释**：支持单行以及行内注释，以 `#` 开头

2. **`automation` 定义块（推荐写法）**

```ruby
automation "<name>" {
  match   "<url pattern>"
  # 可选：可以写多条 match / exclude
  # match   "https://x.com/*"
  # exclude "https://weibo.com/settings/*"
  stage   "<immediate | load | delay>"
}
  # 这里是具体的语句
end
```

> 兼容旧写法：`automation for "{url pattern}" on "{stage}" ... end` 仍然可以被旧解析器识别，但不再推荐。

3. **`statement` 语句**
语句写在 `automation` 块里，主要有以下三大类语句：
- 赋值语句
  - 格式为: `set var = {值 | 变量 | listen 表达式 | get 表达式}`

- 快捷语句
  - `open` 语句： `open "{url}" as "{url pattern}"`，用以打开 `url`，仅当 `url pattern` 集合中的页面已经存在时才会创建新标签页
  - `active` 语句：`active`, 用于选中当前标签页
  - `wait` 语句： `wait {number}`, 用以两条语句间的等待，以秒为单位
  - `close` 语句: `close`, 关闭当前页面
  - `emit` 语句: `emit "{eventName}" with (var1=1, var2=othervar)`，用于向浏览器发出全局事件`eventName`
  - `listen` 语句: `listen "{eventName}" on "CssSelector | global"`，监听来自全局或页面的事件，例如 `global` | `body` | `.cls`

- 执行语句
  - 基础格式：
    - `apply ACTION_NAME with (var1=1, var2=othervar, var=false, ...) on "CssSelector"`
  - 参数规则：
    - `number`：`1`、`2.5`
    - `bool`：`true` / `false`
    - `string`：`"text"`（双引号包裹）
    - `Identifier`：变量名，会从当前 automation 的上下文中取值（`set` 过的变量）
  - `apply` 语句可以执行所有内置的 `action`；本质上讲，快捷语句也都可以由 `apply` 语句改写。
  - `action` 可以查看 [Action 文档](https://types.iautomator.xyz/modules.html)


## 例子

### 微博阅读模式（推荐写法）

```ruby
automation "weibo-readmode" {
  match "https://weibo.com/*"
  stage "load"
}
  apply READ_MODE with (autoScroll=true, excludes=".Frame_wrap_16as0") on "body"
end
```

> 说明：
> - `match` 中的 URL pattern 与扩展内置的匹配规则一致，支持 `*` 通配。
> - `stage "load"` 对应扩展中的 `RunAt.END`，表示在页面加载完成后执行。

### 隐藏/显示元素（HIDE_SHOW）

与阅读模式相同，使用 `visibility` 隐藏（不改变布局）。`visible=true` 表示显示，`visible=false`（默认）表示隐藏。

```ruby
automation "hide-sidebar" {
  match "https://example.com/*"
  stage "load"
}
  apply HIDE_SHOW with (visible=false) on ".sidebar"
end
```

## 文法（v0.2.0 草案）
 ```
Script ::= *empty*
       ::= Automations

Automations   ::= Automation
               ::= Automations

Automation    ::= automation AutomationHead AutomationBody end

AutomationHead ::=
      AutomationNewHead
    | AutomationLegacyHead

AutomationNewHead ::= String '{'
                   MatchClauses
                   StageClause
                   '}'

MatchClauses      ::= MatchClause
                   ::= MatchClauses

MatchClause       ::= match URLRegString
                   ::= exclude URLRegString

StageClause       ::= stage Stage

AutomationLegacyHead ::= for URLRegString on Stage           # 旧写法，兼容但不推荐

Stage          ::= '"immediate"'
               ::= '"load"'
               ::= '"delay"'

URLRegString   ::= string

AutomationBody ::= Statements

Statements     ::= Statement
               ::= Statements
           
Statement ::= AssignStatement
          ::= NativeStatement
          ::= ApplyStatement
          ::= RequireStatement
          
AssignStatement ::= AssignExp = ValuableExp
                
ValuableExp ::= ValueExp
            ::= Identiﬁer
            ::= ListenExp
            ::= GetValueExp
            ::= BuiltinFunctionCall
            
ValueExp ::= number
         ::= string
         ::= bool
            
ListenExp ::= listen EventNameExp on EventScopeExp
EventNameExp ::= string
EventScopeExp ::= '"global"'
              ::= CssSelectorExp
              
NativeStatement ::= OpenStatement
                ::= ActiveStatement
                ::= WaitStatement
                ::= CloseStatement
                ::= EmitStatement
                ::= ListenStatement
                
OpenStatement ::= OpenExp
OpenExp ::= open URLString as URLRegString
URLString ::= string

ActiveStatement ::= ActiveExp
ActiveExp ::= active

WaitStatement ::= WaitExp
WaitExp ::= wait number
                 
CloseStatement ::= close

EmitStatement ::= emit EventNameExp with ArgPairs

ListenStatement ::= ListenExp

ApplyStatement ::= apply ActionNameExp with ArgPairs on CssSelectorExp 
ActionNameExp ::= string

ArgPairs ::= (ArgsExp)
         
ArgsExp ::= empty
        ::= ArgExp
        ::= ArgExp, ArgsExp
        
ArgExp ::= Identiﬁer
       ::= Identiﬁer = ValueExp
       ::= Identiﬁer = Identiﬁer

CssSelectorExp ::= string

RequireStatement ::= require Expression [, ErrorMessage]
ErrorMessage ::= string

Expression ::= ValuableExp ComparisonOperator ValuableExp
ComparisonOperator ::= '>=' | '>' | '<=' | '<' | '=='

BuiltinFunctionCall ::= FunctionName ( CssSelectorExp )
FunctionName ::= 'len' | 'exist'

``` 