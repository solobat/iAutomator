import { ExecOptions } from "@src/buildin/types";

export interface InstructionData {
  action: string;
  args: ExecOptions;
  rawArgs: string;
  scope: string;
}

export interface Instruction<T = string> {
  name: string;
  parse: (raw: T) => InstructionData;
  generate: (data: InstructionData) => T;
  argsHandler: ArgsHandler;
}

interface ArgsHandler {
  parse: (raw: string, action: string) => ExecOptions;
  stringify: (args: ExecOptions, action: string) => string;
}

export const basicArgsHandler: ArgsHandler = {
  parse(raw) {
    const modifiers = raw.split("^");
    const options: ExecOptions = {
      silent: true,
    };

    modifiers.forEach((item) => {
      const [key, ...value] = item.split("!");
      if (value.length) {
        if (value.length === 1) {
          try {
            options[key] = JSON.parse(value[0]);
          } catch (error) {
            options[key] = value[0];
          }
        } else {
          options[key] = value;
        }
      } else {
        options[key] = true;
      }
    });

    return options;
  },

  stringify(args: ExecOptions) {
    const argPairs = Object.entries(args)
      .filter((pair) => pair[0] !== "silent")
      .map((arg) => arg.join("!"));

    return argPairs.join("^");
  },
};

export const basicInstruction: Instruction = {
  name: "basic",

  parse(content) {
    const [actionStr, selector] = content.split("@");
    const [action, ...modifiers] = actionStr.split("^");
    const rawArgs = modifiers.join("^");

    return {
      action,
      scope: selector,
      args: basicInstruction.argsHandler.parse(rawArgs, action),
      rawArgs,
    };
  },

  generate({ action, args, scope }) {
    const fullAction = [
      action,
      basicInstruction.argsHandler.stringify(args, action),
    ].join("^");

    return [fullAction, "@", scope].join("");
  },

  argsHandler: basicArgsHandler,
};
