import { ExecOptions } from "@src/builtin/types";

// 核心结构：一条指令的抽象表示（AST）
export interface InstructionAST {
  action: string;
  scope: string;
  args: ExecOptions;
  comment?: string;
  id?: string | number;
  version?: number;
}

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
    ]
      .filter((str) => str !== "")
      .join("^");

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

/**
 * 将存储的指令字符串解析为统一的 AST 列表。
 * 支持三种格式：
 * 1. JSON 数组   → `[{"action":"...","scope":"...","args":{...}}, ...]`
 * 2. JSON 对象   → `{"action":"...","scope":"...","args":{...}}`
 * 3. 旧的 basic 指令串 → `ACTION^k!v@scope;ACTION2@scope2`
 */
export function parseInstructionContent(content: string): InstructionAST[] {
  const trimmed = content?.trim();

  if (!trimmed) {
    return [];
  }

  // 优先尝试 JSON 数组
  if (trimmed.startsWith("[")) {
    try {
      const data = JSON.parse(trimmed) as any[];
      return (data || []).map((item) => ({
        action: item.action,
        scope: item.scope,
        args: (item.args || {}) as ExecOptions,
        comment: item.comment,
        id: item.id,
        version: item.version,
      }));
    } catch {
      // 解析失败则回落到旧格式解析
    }
  }

  // 单个 JSON 对象
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    try {
      const item = JSON.parse(trimmed) as any;
      return [
        {
          action: item.action,
          scope: item.scope,
          args: (item.args || {}) as ExecOptions,
          comment: item.comment,
          id: item.id,
          version: item.version,
        },
      ];
    } catch {
      // 回落到旧格式解析
    }
  }

  // 旧格式：以 ; 分隔多条，以 ^/@ 分隔 action/参数/scope
  return trimmed
    .split(";")
    .map((instruction) => instruction.trim())
    .filter(Boolean)
    .map((instruction) => {
      const inst = basicInstruction.parse(instruction);

      return {
        action: inst.action,
        scope: inst.scope,
        args: inst.args,
      } as InstructionAST;
    });
}

/**
 * 将 AST 列表序列化为 JSON 数组字符串，用于持久化。
 */
export function stringifyInstructions(list: InstructionAST[]): string {
  const payload = list.map((item) => {
    const { action, scope, args, comment, id, version } = item;
    const base: any = { action, scope, args };

    if (comment) {
      base.comment = comment;
    }
    if (id !== undefined) {
      base.id = id;
    }
    if (version !== undefined) {
      base.version = version;
    }

    return base;
  });

  return JSON.stringify(payload);
}
