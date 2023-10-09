## 版本
v0.1.0

## 语言概述
该语言用于定义自动化脚本，可以通过该脚本来创建浏览器的自动化操作，例如打开网页、点击、输入文字等，从而提高浏览的体验与效率。

## 语言规则
该语言由以下几个部分组成：
1. 注释，支持单行以及行内注释，以 `#` 开头
2. `automation` 定义块:
```ruby
automation for "{url pattern}" on "{stage: immediate | load | delay}"
# 这里是具体的语句
end
```
3. `statement` 语句
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
  - 格式为: `apply "{actionName}" with (var1=1, var2=othervar, var=false, ...) on "CssSelector"`
  - `apply` 语句可以执行所有内置的 `action`；本质上讲，快捷语句也都可以由 `apply` 语句改写。
  - `action` 可以查看 [Action 文档](https://types.ihelpers.xyz/modules.html)


## 例子
- 微博阅读模式
  ```ruby
  automation for "https://weibo.com/*" on "load"
    apply "readMode" with (excludes=".Frame_wrap_16as0")  on "#homeWrap"
  end
  ```

 ## 文法
 ```
Script ::= *empty*
       ::= Automations

Automations ::= Automation
            ::= Automations
Automation ::= automation AutomationHead AutomationBody end

AutomationHead ::= for URLRegString on Stage
Stage ::= '"immediate"'
      ::= '"load"'
      ::= '"delay"'
      
URLRegString ::= string
      
AutomationBody ::= Statements
Statements ::= Statement
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