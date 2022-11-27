### Step 1

create a file in `src/buildin/`, and `extends Base.ts`, such as

```ts
import Base, { ExecOptions } from "./Base";
import { BUILDIN_ACTIONS } from "../common/const";

export default class ClickElement extends Base {
  // NOTE: the new action key/value should be added in src/commmon/const/index.ts
  name = BUILDIN_ACTIONS.CLICK;

  // NOTE: if the action need to listen some events, you should create a constructor at here, and call super(helper, options) in it
  constructor(helper: DomHelper) {
    super(helper, {
      shouldRecord: true,
      esc2exit: true,
    });
  }

  // required
  // the main logic of the action
  exec(elem, options?: ExecOptions) {
    elem.click();
    this.recordIfNeeded(options);

    return true;
  }
}
```

### Step 2

register action in `src/content/app.ts#init` function
