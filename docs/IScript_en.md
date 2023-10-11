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
  - `action` can be viewed in the [Action documentation](https://types.ihelpers.xyz/modules.html). 

## Example
- Weibo Read-Mode
  ```ruby
  automation for "https://weibo.com/*" on "load"
    apply "readMode" with (excludes=".Frame_wrap_16as0")  on "#homeWrap"
  end
  ```

 ## Language Grammar 
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