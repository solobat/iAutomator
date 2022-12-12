import { expect, test } from "vitest";
import { mergeQuery } from "../../src/helper/url";

test("mergeQuery test", () => {
  expect(mergeQuery("word=god", "?word=pieces&lang=en")).toBe(
    "word=god&lang=en"
  );

  expect(mergeQuery("god", "?word=pieces&lang=en", "arr")).toBe(
    "word=god&lang=en"
  );
});
