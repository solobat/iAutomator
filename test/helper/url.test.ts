import { expect, test } from "vitest";
import {
  mergeQuery,
  generateURLByType,
  generateURL,
  isParamEqual,
  isSE,
  isFromSE,
} from "../../src/helper/url";

test("mergeQuery test", () => {
  expect(mergeQuery("word=god", "?word=pieces&lang=en")).toBe(
    "word=god&lang=en"
  );

  expect(mergeQuery("god", "?word=pieces&lang=en", "arr")).toBe(
    "word=god&lang=en"
  );
});

test("generateURLByType test", () => {
  expect(generateURLByType("baike", { 0: "javascript" })).toBe(
    "https://baike.baidu.com/item/javascript"
  );
});

test("generateURL test", () => {
  expect(
    generateURL("https://baike.baidu.com/item/:0", { 0: "javascript" })
  ).toBe("https://baike.baidu.com/item/javascript");
});

test("test isParamEqual", () => {
  expect(isParamEqual("https://www.zhihu.com/follow?pass=1", "pass")).toBe(
    true
  );
});

test("test isSE", () => {
  expect(
    isSE(
      "https://www.baidu.com/link?url=xmZL_VwF7Kf7lCg0WXi7sFtM-M3yYgs2QOZRPbtr8t0Ah90cEn8TE-ohLIwNAHg6UhPZVxqAtZ4tr2KCY9AwTJZlRcr1OKx-_DTbjtK43vG&wd=&eqid=c23b22b30000b7dd00000006639af5e5"
    )
  ).toBe(true);

  expect(
    isSE("http://www.google.com.hk/search?q=yes&ie=utf-8&oe=utf-8&aq=t")
  ).toBe(true);

  expect(isSE("")).toBe(false);
});

test("test isFromSE", () => {
  expect(
    isFromSE(
      "https://www.baidu.com/link?url=xmZL_VwF7Kf7lCg0WXi7sFtM-M3yYgs2QOZRPbtr8t0Ah90cEn8TE-ohLIwNAHg6UhPZVxqAtZ4tr2KCY9AwTJZlRcr1OKx-_DTbjtK43vG&wd=&eqid=c23b22b30000b7dd00000006639af5e5"
    )
  ).toBe(true);

  expect(
    isFromSE("http://www.google.com.hk/search?q=yes&ie=utf-8&oe=utf-8&aq=t")
  ).toBe(true);

  expect(isFromSE("")).toBe(false);
});
