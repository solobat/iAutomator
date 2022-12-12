import { ExecOptions } from "@src/builtin/types";

export interface InstructionData {
  action: string;
  args: ExecOptions;
  rawArgs: string;
  scope: string;
}

export interface Instruction<T = string> {
  name: string;
  parse: (raw: T) => InstructionData | null;
  generate: (data: InstructionData) => T;
  argsHandler: ArgsHandler;
  is: (raw: T) => boolean;
}

interface ArgsHandler<T = string> {
  parse: (raw: T, action: string) => ExecOptions;
  stringify: (args: ExecOptions, action: string) => T;
}

const argsFilter = (args: ExecOptions) => {
  const clone = Object.assign({}, args);

  delete clone.silent;

  return clone;
};

export const basicArgsHandler: ArgsHandler = {
  parse(raw) {
    const modifiers = raw.split("^");
    const options: ExecOptions = {
      silent: true,
    };

    if (!raw) {
      return options;
    }

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
    const argPairs = Object.entries(argsFilter(args)).map((arg) =>
      arg.join("!")
    );

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

  is(raw) {
    return raw.indexOf("^") > -1 && raw.indexOf("@") > -1;
  },

  argsHandler: basicArgsHandler,
};

const jsonArgsHandler: ArgsHandler = {
  parse(raw) {
    try {
      return JSON.parse(raw);
    } catch (erroar) {
      return {};
    }
  },

  stringify(args) {
    return JSON.stringify(argsFilter(args));
  },
};

export const jsonInstruction: Instruction = {
  name: "json",

  parse(content) {
    try {
      const data = JSON.parse(content);
      const { action, scope, args } = data;

      return {
        action,
        scope,
        args,
        rawArgs: JSON.stringify(args),
      };
    } catch (error) {
      return null;
    }
  },

  generate(data) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { rawArgs, ...info } = data;

    return JSON.stringify(info);
  },

  is(raw) {
    return raw.startsWith("{") && raw.endsWith("}");
  },

  argsHandler: jsonArgsHandler,
};

export function getInstruction<T extends string>(raw: T) {
  return [basicInstruction, jsonInstruction].find((t) => t.is(raw));
}
