import { expect, test } from "vitest";
import {
  basicArgsHandler,
  basicInstruction,
} from "../../src/helper/instruction";

test("basicArgsHandler test", () => {
  expect(basicArgsHandler.parse("", "readMode")).toEqual({ silent: true });
  expect(basicArgsHandler.stringify({}, "readMode")).toEqual("");
});

test("basicInstruction test", () => {
  expect(
    basicInstruction.generate({
      scope: "body",
      action: "readMode",
      args: {},
      rawArgs: "",
    })
  ).toBe("readMode@body");
});
