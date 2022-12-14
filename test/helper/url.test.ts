import { expect, test } from "vitest";
import {
  mergeQuery,
  generateURLByType,
  generateURL,
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
