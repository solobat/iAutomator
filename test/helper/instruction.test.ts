import { expect, test } from "vitest";
import { basicArgsHandler } from "../../src/helper/instruction";

test("basicArgsHandler test", () => {
  expect(basicArgsHandler.parse("", "readMode")).toEqual({ silent: true });
});
