import { expect, test } from "vitest";
import { parseScript } from "../../src/helper/script";

// test("tokenize work", () => {
//   const tokens = tokenize(
//     `
// automaion for "https://movie.douban.com" on "load"
//   set value = listen "copy" on "page"
//   open "https://www.bt-tt.com" as "https://www.bt-tt.com/*"
//   wait 2
//   emit "search" with (value=value)
// end

// automation for "https://bt-tt.com" on "load"
//   set movie = listen "search" on "global"
//   active
//   apply "setValue" with (value=movie) on "#search-keyword"
//   apply "click" on ".sub"
// end

//   `.trim()
//   );

//   expect(tokens.length > 0).toBe(true);
// });

test("parse work", () => {
  const automations = parseScript(
    `
  automation for "https://baidu.com" on "load"
    apply "readMode" with (target=".main-content") on "body"  
  end
  
  automation for "https://movie.douban.com" on "load"
    set value = listen "copy" on "page"
    open "https://www.bt-tt.com" as "https://www.bt-tt.com/*"
    wait 2
    emit "search" with (value=value)
  end
  
  automation for "https://bt-tt.com" on "load"
    set movie = listen "search" on "global"
    active
    apply "setValue" with (value=movie) on "#search-keyword"
    apply "click" with () on ".sub"
  end
  
  `.trim()
  );

  expect(automations.length > 0).toBe(true);
});
