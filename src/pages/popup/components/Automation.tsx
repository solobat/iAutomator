import {
  Alert,
  AutoComplete,
  Popover,
  Radio,
  RadioChangeEvent,
  Tooltip,
} from "antd";
import Button from "antd/es/button";
import ButtonGroup from "antd/es/button/button-group";
import message from "antd/es/message";
import Input from "antd/es/input";
import Select from "antd/es/select";
import Switch from "antd/es/switch";
import Table from "antd/es/table";
import * as React from "react";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";

import {
  DeleteOutlined,
  EditFilled,
  EditOutlined,
  MacCommandOutlined,
  MinusSquareOutlined,
  PlusSquareOutlined,
  QuestionCircleOutlined,
  SearchOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";
import { PlayCircleOutlined } from "@ant-design/icons";
import { list2options } from "@src/helper/antd";
import { t } from "@src/helper/i18n.helper";
import {
  InstructionAST,
  basicArgsHandler,
  parseInstructionContent,
  stringifyInstructions,
} from "@src/helper/instruction";
import { parseIscript } from "@src/helper/script";
import { getURLPatterns } from "@src/helper/url";
import { IAutomation } from "@src/server/db/database";
import Automation from "@src/server/model/Automation";
import "prismjs/themes/prism.css";

import {
  ActionArg,
  APP_ACTIONS,
  BUILDIN_ACTION_FIELD_CONFIGS,
  BUILTIN_ACTIONS,
  PAGE_ACTIONS,
} from "../../../common/const";
import { matchAutomations } from "../../../helper/automations";
import { noticeBg } from "../../../helper/event";
import Response from "../../../server/common/response";
import * as automationsController from "../../../server/controller/automations.controller";
import { RunAt as RunAtEnum } from "../../../server/enum/Automation.enum";
import {
  ACTIONS,
  AmFormEditing,
  PageContext,
  PageState,
  useModel,
} from "../../../store/modules/popup.store";
import { parseScript, iscript } from "@src/helper/script";
import Editor from "react-simple-code-editor";
import { Grammar, highlight } from "prismjs";
import Form from "antd/es/form";
import { ExecOptions } from "@src/builtin/types";
import { useToggle } from "ahooks";

const { Option } = Select;
const hightlightWithLineNumbers = (
  input: string,
  grammar: Grammar,
  language: string
) =>
  highlight(input, grammar, language)
    .split("\n")
    .map((line, i) => `<span class='editorLineNumber'>${i + 1}</span>${line}`)
    .join("\n");

export function AutomationsPanel() {
  const { state } = useContext(PageContext);
  const { amFormEditing } = state;

  return (
    <div>
      {amFormEditing === AmFormEditing.Instruction && <AutomationEditor />}
      {amFormEditing === AmFormEditing.Script && <ScriptsEditor />}
      {amFormEditing === AmFormEditing.False && <Buttons />}
      <Automations />
    </div>
  );
}

function QuickAddContent(props: {
  state: PageState;
  dispatch: React.Dispatch<any>;
  onClose: () => void;
}) {
  const { state, dispatch, onClose } = props;
  const host = state.tab?.host || "";
  const defaultPattern = host ? `https://${host}/*` : "";
  const [actionValue, setActionValue] = useState<string>("");
  const [pattern, setPattern] = useState(defaultPattern);

  const cfg = BUILDIN_ACTION_FIELD_CONFIGS.find((c) => c.value === actionValue);

  const onCreate = () => {
    if (!cfg) return;
    const defaultArgs: Record<string, unknown> = {};
    cfg.args?.forEach((a) => {
      defaultArgs[a.name] = a.defaultValue !== undefined ? a.defaultValue : a.value;
    });
    const rawArgs = basicArgsHandler.stringify(
      defaultArgs as import("@src/builtin/types").ExecOptions,
      cfg.value
    );
    const row = {
      action: cfg.value,
      rawArgs,
      scope: "body",
    };
    dispatch({
      type: ACTIONS.AUTOMATION_FORM_UPDATE,
      payload: {
        pattern: pattern || defaultPattern,
        name: `${cfg.label} - ${host || "site"}`,
        runAt: RunAtEnum.END,
        data: [row],
      },
      editingMode: AmFormEditing.Instruction,
    });
    onClose();
  };

  return (
    <div className="am-quick-add-content" style={{ width: 280 }}>
      <div style={{ marginBottom: 8 }}>
        <div style={{ marginBottom: 4, fontSize: 12 }}>
          {t("quick_add_action_label")}
        </div>
        <Select
          placeholder={t("quick_add_action_label")}
          value={actionValue || undefined}
          onChange={setActionValue}
          style={{ width: "100%" }}
          options={BUILDIN_ACTION_FIELD_CONFIGS.map((c) => {
            // Hide description when it looks like an untranslated i18n key (e.g. read_mode_desc)
            const desc =
              c.description && !/^[a-z0-9_]+_desc$/i.test(c.description)
                ? c.description
                : "";
            return {
              value: c.value,
              label: desc ? `${c.label} — ${desc}` : c.label,
            };
          })}
        />
      </div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ marginBottom: 4, fontSize: 12 }}>
          {t("quick_add_site_label")}
        </div>
        <Input
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          placeholder="https://example.com/*"
        />
      </div>
      <Button type="primary" block onClick={onCreate} disabled={!cfg}>
        {t("quick_add_create_btn")}
      </Button>
    </div>
  );
}

function Buttons() {
  const { state, dispatch } = useContext(PageContext);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  return (
    <ButtonGroup style={{ marginBottom: "10px" }}>
      <MenuBtn
        onClick={() =>
          chrome.tabs.create({ url: "https://iautomator.xyz/automations" })
        }
        icon={
          <SearchOutlined
            style={{ fontSize: "20px", cursor: "pointer" }}
            translate="no"
          />
        }
        label={t("get_new_automations")}
      />

      <MenuBtn
        onClick={() =>
          dispatch({
            type: ACTIONS.AUTOMATION_FORM_UPDATE,
            payload: { instructions: "", pattern: "" },
          })
        }
        icon={
          <PlusSquareOutlined
            style={{ fontSize: "20px", cursor: "pointer" }}
            translate="no"
          />
        }
        styles={{ marginLeft: "10px" }}
        label={t("add_automation")}
      />

      <Popover
        content={
          <QuickAddContent
            state={state}
            dispatch={dispatch}
            onClose={() => setQuickAddOpen(false)}
          />
        }
        title={t("quick_add")}
        trigger="click"
        open={quickAddOpen}
        onOpenChange={setQuickAddOpen}
      >
        <Button
          style={{ marginLeft: "6px" }}
          icon={<PlusSquareOutlined translate="no" />}
        >
          {t("quick_add")}
        </Button>
      </Popover>

      <MenuBtn
        onClick={() =>
          dispatch({
            type: ACTIONS.AUTOMATION_FORM_UPDATE,
            payload: {},
            editingMode: AmFormEditing.Script,
          })
        }
        icon={
          <MacCommandOutlined
            style={{ fontSize: "18px", cursor: "pointer" }}
            translate="no"
          />
        }
        styles={{ marginLeft: "6px" }}
        label={t("use_script_instead")}
      />
    </ButtonGroup>
  );
}

function MenuBtn(props: {
  onClick?: () => void;
  label: string;
  icon: React.ReactNode;
  styles?: React.CSSProperties;
}) {
  return (
    <Button
      onClick={props.onClick}
      style={{
        display: "flex",
        borderRadius: "6px",
        alignItems: "center",
        ...props.styles,
      }}
      icon={props.icon}
    >
      {props.label}
    </Button>
  );
}

const defaultScript = `
# example, see: https://docs.iautomator.xyz/IScript_en.html
automation "weibo-readmode" {
  match "https://weibo.com/*"
  stage "load"
}
  apply READ_MODE with (autoScroll=true, excludes=".Frame_wrap_16as0") on "body"
end
`;

const EXAMPLE_AUTOMATION_SCRIPT = `# example, see: https://docs.iautomator.xyz/IScript_en.html
automation "zhihu-readmode" {
  match "https://www.zhihu.com/question/*"
  stage "load"
}
  apply READ_MODE with (autoScroll=true) on "#QuestionAnswers-answers"
end
`;

const EXAMPLE_AUTOMATION_PATTERN = "https://www.zhihu.com/question/*";
const EXAMPLE_AUTOMATION_NAME = "Zhihu Read Mode (example)";

function ScriptsEditor() {
  const { dispatch, state } = useContext(PageContext);
  const form = state.automationForm as PageState["automationForm"];
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [scripts, setScripts] = useState(
    (form.scripts || defaultScript).trim()
  );
  const [saving, setSaving] = useState(false);
  const onCloseAlert = () => {
    setError("");
    setSuccess("");
  };
  const onChange = (value: string) => {
    setScripts(value);
  };
  const onCancel = () => {
    dispatch({ type: ACTIONS.AUTOMATION_FORM_CLOSE, payload: null });
  };
  const onTest = () => {
    try {
      const result = parseIscript(scripts);
      console.log("parse scripts result: ", result);
      setError("");
      setSuccess("parse successfully");

      return result;
    } catch (error) {
      console.log(error);
      setSuccess("");
      setError(error.message);
      return false;
    }
  };
  const onSave = () => {
    setSaving(true);
    const result = onTest();
    if (result) {
      const metaName = result[0]?.name || "New Script";
      automationsController
        .saveAutomation(
          "",
          scripts,
          result[0].pattern,
          result[0].runAt,
          metaName,
          form.id
        )
        .then((resp) => {
          if (resp.code === 0) {
            setSaving(false);
            dispatch({ type: ACTIONS.AUTOMATION_FORM_CLOSE, payload: null });
            noticeBg({
              action: PAGE_ACTIONS.REFRESH_AUTOMATIONS,
            });
            noticeBg({
              action: APP_ACTIONS.AUTOMATION_UPDATED,
              data: {
                type: "create",
                new: {
                  id: form.id,
                  pattern: result[0].pattern,
                  runAt: result[0].runAt,
                  scripts,
                  active: true,
                  name: metaName,
                },
              },
            });
          }
        });
    } else {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="am-editor-template-hint" style={{ marginBottom: 6 }}>
        {t("template_script_hint")}
      </div>
      <Select
        placeholder="Generate script from action template"
        style={{ width: "100%", marginBottom: 8 }}
        onChange={(actionValue: string) => {
          const cfg = BUILDIN_ACTION_FIELD_CONFIGS.find(
            (item) => item.value === actionValue
          );
          if (!cfg) {
            return;
          }
          // 反向从 BUILTIN_ACTIONS 中找到 DSL 使用的大写常量名，例如 READ_MODE
          const builtinKey =
            Object.keys(BUILTIN_ACTIONS).find(
              (k) => (BUILTIN_ACTIONS as any)[k] === cfg.value
            ) || actionValue.toUpperCase();
          const host = state.tab?.host || "{host}";
          const templateName = `${cfg.value.toLowerCase()}-${host}`;
          const headerLines = [
            `# Template: ${cfg.label} (${builtinKey})`,
            `# This script was generated from action template. You can tweak url, selector and arguments.`,
            `automation "${templateName}" {`,
            `  match "https://${host}/*"`,
            `  stage "load"`,
            `}`,
          ];

          const bodyLines: string[] = [];
          if (!cfg.args || cfg.args.length === 0) {
            bodyLines.push(
              `  # This action has no configurable arguments currently.`
            );
            bodyLines.push(`  apply ${builtinKey} with () on "body"`);
          } else {
            const comments: string[] = [];
            const assignments: string[] = [];
            cfg.args.forEach((arg) => {
              const def =
                arg.defaultValue ??
                (arg.type === "number"
                  ? 0
                  : arg.type === "boolean"
                  ? false
                  : "");
              const valueStr =
                arg.type === "string" ? `"${def ?? ""}"` : String(def ?? "");
              const comment = arg.tips
                ? `  # ${arg.name}: ${arg.tips}`
                : `  # ${arg.name}`;
              comments.push(comment);
              assignments.push(`${arg.name}=${valueStr}`);
            });
            bodyLines.push(...comments);
            bodyLines.push(
              `  apply ${builtinKey} with (${assignments.join(", ")}) on "body"`
            );
          }
          bodyLines.push(`end`);

          const tpl = [...headerLines, ...bodyLines].join("\n");
          setScripts(tpl.trim());
          setError("");
          setSuccess("");
        }}
        options={BUILDIN_ACTION_FIELD_CONFIGS.map((cfg) => ({
          label: `${cfg.value} - ${cfg.label}`,
          value: cfg.value,
        }))}
      />
      {error && (
        <Alert message={error} type="error" closable onClose={onCloseAlert} />
      )}
      {success && (
        <Alert
          message={success}
          type="success"
          closable
          onClose={onCloseAlert}
        />
      )}
      <Editor
        value={scripts}
        onValueChange={onChange}
        highlight={(code) =>
          hightlightWithLineNumbers(code, iscript, "iscript")
        }
        padding={10}
        className="editor"
        style={{
          marginTop: "5px",
          fontFamily: '"Fira code", "Fira Mono", monospace',
          fontSize: 14,
          outline: 0,
          backgroundColor: "#f5f5f5",
          borderRadius: "6px",
        }}
      />
      <div className="am-editor-btns">
        <Button onClick={() => onCancel()} style={{ marginRight: "10px" }}>
          {t("cancel")}
        </Button>
        <Button onClick={() => onTest()} style={{ marginRight: "10px" }}>
          {t("test")}
        </Button>
        <Button disabled={saving} onClick={() => onSave()}>
          {t("save")}
        </Button>
      </div>
    </div>
  );
}

function validateAmForm(instructions: string, pattern: string) {
  if (instructions && pattern) {
    return true;
  } else {
    return false;
  }
}

function onAmFormChange(attrs, dispatch) {
  dispatch({ type: ACTIONS.AUTOMATION_FORM_UPDATE, payload: attrs });
}

function AutomationEditor() {
  const { state, dispatch } = useContext(PageContext);
  const form = state.automationForm as PageState["automationForm"];
  const initialDataRef = React.useRef(state.automationForm);
  const [saving, setSaving] = useState(false);
  const [allAutomations, setAllAutomations] = useState<IAutomation[]>([]);
  const urlPatterns = getURLPatterns(state.tab.host, state.tab.pathname);
  const boxRef = React.useRef<HTMLDivElement>(null);

  function onAmEditorSaveClick() {
    const { pattern, data } = form;
    const astList: InstructionAST[] = data.map((item) => {
      const args = basicArgsHandler.parse(item.rawArgs, item.action);

      return {
        action: item.action,
        scope: item.scope,
        args,
      };
    });
    const instructions = stringifyInstructions(astList);

    if (validateAmForm(instructions, pattern)) {
      setSaving(true);
      automationsController
        .saveAutomation(
          instructions,
          "",
          pattern,
          form.runAt,
          form.name,
          form.id
        )
        .then((resp) => {
          if (resp.code === 0) {
            setSaving(false);
            dispatch({ type: ACTIONS.AUTOMATION_FORM_CLOSE, payload: null });
            noticeBg({
              action: APP_ACTIONS.AUTOMATION_UPDATED,
              data: {
                type: form.id ? "update" : "create",
                old: initialDataRef.current,
                new: {
                  ...form,
                  pattern,
                  instructions,
                },
              },
            });
          }
        });
    }
  }

  function onAmEditorCancleClick() {
    dispatch({ type: ACTIONS.AUTOMATION_FORM_CLOSE, payload: null });
  }

  useEffect(() => {
    boxRef.current?.scrollIntoView();
  }, [form.id]);

  useEffect(() => {
    automationsController.getList().then((res: Response) => {
      if (res.code === 0) {
        setAllAutomations(res.data ?? []);
      }
    });
  }, []);

  return (
    <div className="am-editor" ref={boxRef}>
      <div className="am-editor-copy">
        <Select
          placeholder="Copy from existing automation"
          onChange={(id: number) => {
            const source = allAutomations.find((item) => item.id === id);
            if (!source) {
              return;
            }
            const isScript = !!source.scripts;
            const instructions = source.instructions || "";
            const astList = !isScript
              ? parseInstructionContent(instructions)
              : [];
            const data =
              !isScript && astList.length
                ? astList.map((ast) => ({
                    action: ast.action,
                    rawArgs: basicArgsHandler.stringify(ast.args, ast.action),
                    scope: ast.scope,
                  }))
                : form.data;

            const nextForm = {
              ...form,
              id: undefined,
              name: source.name,
              runAt: source.runAt,
              // 不复制原来的域名 / pattern，使用当前表单里的（通常为空，由用户选择）
              pattern: form.pattern,
              instructions,
              scripts: source.scripts || "",
              data,
            };

            dispatch({
              type: ACTIONS.AUTOMATION_FORM_UPDATE,
              payload: nextForm,
              editingMode: isScript
                ? AmFormEditing.Script
                : AmFormEditing.Instruction,
            });
          }}
          options={allAutomations.map((item) => ({
            label: `${item.name || "Automation"} (${item.pattern})`,
            value: item.id,
          }))}
        />
      </div>
      <div className="am-editor-fields">
        <Input
          value={form.name}
          placeholder={t("name")}
          className="ipt-name"
          onChange={(event) => {
            onAmFormChange(
              {
                name: event.target.value,
              },
              dispatch
            );
          }}
        />
      </div>
      <div className="am-ins-editor-box">
        {form.data.map((item, index) => (
          <InstructionEditor
            form={item}
            dispatch={dispatch}
            index={index}
            key={index}
          />
        ))}
      </div>
      <div className="am-editor-fields">
        <AutoComplete
          placeholder={t("pattern")}
          value={form.pattern}
          className="ipt-pattern"
          onChange={(value) => {
            onAmFormChange(
              {
                pattern: value,
              },
              dispatch
            );
          }}
          options={list2options(urlPatterns)}
        ></AutoComplete>
        <Select
          value={form.runAt}
          onChange={(value) => {
            onAmFormChange(
              {
                runAt: value,
              },
              dispatch
            );
          }}
          suffixIcon={<PlayCircleOutlined />}
        >
          <Option value={0}>{t("run_at_immediately")}</Option>
          <Option value={1}>{t("run_at_dom_ready")}</Option>
          <Option value={2}>{t("run_at_delayed")}</Option>
        </Select>
      </div>
      <div className="am-editor-btns">
        <Button
          onClick={() => onAmEditorCancleClick()}
          style={{ marginRight: "10px" }}
        >
          {t("cancel")}
        </Button>
        <Button disabled={saving} onClick={() => onAmEditorSaveClick()}>
          {t("save")}
        </Button>
      </div>
    </div>
  );
}

function onAmFormInsChange(attrs, index: number, dispatch) {
  dispatch({
    type: ACTIONS.AUTOMATION_FORM_UPDATE_INS,
    payload: {
      changes: attrs,
      index,
    },
  });
}

function ActionArgsForm(props: {
  config?: ActionArg[];
  defaultValues: ExecOptions;
  onChange: (changedValues: any, values: any) => void;
}) {
  const { config: args = [], onChange, defaultValues } = props;
  const [form] = Form.useForm();

  return (
    <Form
      layout="horizontal"
      form={form}
      onValuesChange={onChange}
      initialValues={defaultValues}
      style={{ width: "326px" }}
    >
      {args.map((arg) => (
        <ActionArgField arg={arg} key={arg.name} />
      ))}
    </Form>
  );
}

function ArgLabel(props: { name: string; tips?: string }) {
  const { name, tips } = props;
  if (!tips) return <>{name}</>;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
      {name}
      <Tooltip title={tips}>
        <QuestionCircleOutlined className="am-arg-tip-icon" translate="no" />
      </Tooltip>
    </span>
  );
}

function ActionArgField(props: { arg: ActionArg }) {
  const { arg } = props;
  const label = <ArgLabel name={arg.name} tips={arg.tips} />;

  return (
    <>
      {arg.type === "boolean" && (
        <Form.Item
          label={label}
          name={arg.name}
          valuePropName="checked"
          required={arg.required}
        >
          <Switch title={arg.tips} defaultChecked={arg.defaultValue === true} />
        </Form.Item>
      )}
      {arg.type === "string" &&
        (arg.optionalValues ? (
          <Form.Item label={label} name={arg.name} required={arg.required}>
            <Select>
              {arg.optionalValues.map((item, index) => (
                <Option value={item} key={index}>
                  {item}
                </Option>
              ))}
            </Select>
          </Form.Item>
        ) : (
          <Form.Item label={label} name={arg.name} required={arg.required}>
            <Input
              placeholder={arg.tips}
              defaultValue={arg.defaultValue as string}
              suffix={arg.suffix}
            />
          </Form.Item>
        ))}
      {arg.type === "number" && (
        <Form.Item label={label} name={arg.name} required={arg.required}>
          <Input
            type="number"
            placeholder={arg.tips}
            defaultValue={arg.defaultValue as number}
            suffix={arg.suffix}
          />
        </Form.Item>
      )}
    </>
  );
}

function InstructionEditor(props: {
  form: Omit<InstructionAST, "args"> & { rawArgs: string };
  index: number;
  dispatch;
}) {
  const { form, dispatch } = props;
  const actionItem = BUILDIN_ACTION_FIELD_CONFIGS.find(
    (item) => item.value === form.action
  );
  function onAddNewInsClick() {
    dispatch({
      type: ACTIONS.AUTOMATION_FORM_NEW_INS,
      payload: { index: props.index + 1 },
    });
  }
  function onDelInsClick() {
    dispatch({
      type: ACTIONS.AUTOMATION_FORM_DEL_INS,
      payload: { index: props.index },
    });
  }
  const onArgsChange = (action: string, values: any) => {
    const args = basicArgsHandler.stringify(values, action);
    onAmFormInsChange(
      {
        rawArgs: args,
      },
      props.index,
      dispatch
    );
  };

  const parsedArgs = basicArgsHandler.parse(form.rawArgs, actionItem?.value);
  const argSummary = Object.keys(parsedArgs)
    .filter((key) => key !== "silent")
    .map((key) => `${key}=${String(parsedArgs[key])}`)
    .join(", ");

  return (
    <Input.Group compact className="am-ins-editor">
      <Select
        style={{ width: 150 }}
        value={form.action}
        defaultValue={BUILTIN_ACTIONS.READ_MODE}
        onChange={(value) => {
          onAmFormInsChange(
            {
              action: value,
              rawArgs: "",
            },
            props.index,
            dispatch
          );
        }}
      >
        {BUILDIN_ACTION_FIELD_CONFIGS.map((item) => (
          <Option value={item.value} key={item.value}>
            {item.label}
          </Option>
        ))}
      </Select>
      <Input
        placeholder={t("arguments")}
        value={argSummary}
        className="ipt-ins"
        readOnly
        style={{ width: 370 }}
        suffix={
          <Popover
            placement={"bottomRight"}
            title="Arguments"
            trigger="click"
            content={
              <ActionArgsForm
                config={actionItem?.args}
                defaultValues={parsedArgs}
                onChange={(_, values) =>
                  onArgsChange(actionItem?.value, values)
                }
              />
            }
          >
            <EditOutlined />
          </Popover>
        }
      />
      <Input
        prefix="@"
        placeholder="scope"
        onChange={(event) => {
          onAmFormInsChange(
            {
              scope: event.target.value,
            },
            props.index,
            dispatch
          );
        }}
        value={form.scope}
        style={{ width: 150 }}
      />
      <div className="am-ins-editor-btns">
        <PlusSquareOutlined size={25} onClick={onAddNewInsClick} />
        <MinusSquareOutlined
          size={25}
          onClick={onDelInsClick}
          style={{ marginLeft: "5px" }}
        />
      </div>
    </Input.Group>
  );
}

const AutomationsColumns = [
  {
    title: t("id"),
    dataIndex: "id",
    width: "50px",
  },
  {
    title: t("name"),
    dataIndex: "name",
    width: "180px",
    textWrap: "word-break",
    ellipsis: true,
    render: (runAt, record) => <ItemName record={record} />,
  },
  {
    title: t("run_at"),
    dataIndex: "runAt",
    render: (runAt, record) => <RunAt record={record} />,
  },
  {
    title: t("operation"),
    width: "120px",
    render: (text, record) => <OpBtns record={record} />,
  },
];

function ItemName(props: any) {
  const { state, dispatch } = useModel();
  const [editable, setEditable] = useState(false);
  const [name, setName] = useState(props.record.name);
  const onChange = (event) => {
    setName(event.target.value);
  };
  const onEnter = () => {
    automationsController
      .updateAutomation(props.record.id, {
        name,
      })
      .then(() => {
        setEditable(false);
        fetchList(state, dispatch).then(() => {
          noticeBg({ action: PAGE_ACTIONS.REFRESH_AUTOMATIONS });
        });
      });
  };

  return (
    <Input
      value={name}
      disabled={!editable}
      onChange={onChange}
      suffix={!editable && <EditFilled onClick={() => setEditable(true)} />}
      onPressEnter={onEnter}
    ></Input>
  );
}

function RunAt(props: any) {
  const { state, dispatch } = useModel();
  const onChange = useCallback((value) => {
    const oldRecord = { ...props.record };
    props.record.runAt = value;
    automationsController
      .updateAutomation(props.record.id, {
        runAt: value,
      })
      .then(() => {
        fetchList(state, dispatch).then(() => {
          noticeBg({ action: PAGE_ACTIONS.REFRESH_AUTOMATIONS });
          noticeBg({
            action: APP_ACTIONS.AUTOMATION_UPDATED,
            data: {
              type: "update",
              old: oldRecord,
              new: props.record,
            },
          });
        });
      });
  }, []);

  return (
    <Select value={props.record.runAt} onChange={onChange}>
      <Option value={0}>{t("run_at_immediately")}</Option>
      <Option value={1}>{t("run_at_dom_ready")}</Option>
      <Option value={2}>{t("run_at_delayed")}</Option>
    </Select>
  );
}

function OpBtns(props: any) {
  return (
    <div
      className="op-btns"
      style={{ minWidth: "120px", display: "flex", alignItems: "center" }}
    >
      <SwitchBtn record={props.record} />
      <EditBtn record={props.record} />
      <ShareBtn item={props.record} />
      <ShortcutBtn item={props.record} />
      <DeleteBtn record={props.record} />
    </div>
  );
}

function SwitchBtn(props: any) {
  const { state, dispatch } = useModel();
  const onChange = useCallback((checked) => {
    props.record.active = checked;
    automationsController
      .updateAutomation(props.record.id, {
        active: checked,
      })
      .then(() => {
        fetchList(state, dispatch).then(() => {
          noticeBg({
            action: APP_ACTIONS.AUTOMATION_UPDATED,
            data: {
              type: checked ? "create" : "delete",
              old: checked ? null : props.record,
              new: checked ? props.record : null,
            },
          });
        });
      });
  }, []);

  return (
    <Switch size="small" checked={props.record.active} onChange={onChange} />
  );
}

function EditBtn(props: { record: IAutomation }) {
  const { dispatch } = useModel();
  const onClick = useCallback(() => {
    const astList = parseInstructionContent(props.record.instructions || "");
    const data =
      astList.length > 0
        ? astList.map((ast) => ({
            action: ast.action,
            rawArgs: basicArgsHandler.stringify(ast.args, ast.action),
            scope: ast.scope,
          }))
        : [];
    const record = {
      ...props.record,
      data,
    };
    dispatch({
      type: ACTIONS.AUTOMATION_FORM_UPDATE,
      payload: record,
      editingMode: props.record.scripts
        ? AmFormEditing.Script
        : AmFormEditing.Instruction,
    });
  }, []);

  return (
    <span onClick={onClick}>
      <EditOutlined translate="no" />
    </span>
  );
}

function getShareURL(item: Automation) {
  const { instructions, runAt, pattern } = item;

  return `https://iautomator.xyz/create?instructions=${encodeURIComponent(
    instructions
  )}&runAt=${runAt}&pattern=${encodeURIComponent(pattern)}`;
}

function ShareBtn(props: { item: Automation }) {
  const onClick = () => {
    const url = getShareURL(props.item);
    chrome.tabs.create({ url });
  };

  return (
    <span onClick={onClick}>
      <ShareAltOutlined translate="no" />
    </span>
  );
}

function onShortcutBtnClick(record, dispatch) {
  const payload = {
    aid: record.id,
  };
  dispatch({ type: ACTIONS.TAB_CHANGE, payload: "shortcuts" });
  dispatch({ type: ACTIONS.SHORTCUT_FORM_UPDATE, payload });
}

function ShortcutBtn(props: { item: Automation }) {
  const { dispatch } = useModel();

  return (
    <span onClick={() => onShortcutBtnClick(props.item, dispatch)}>
      <MacCommandOutlined translate="no" />
    </span>
  );
}

function DeleteBtn(props: any) {
  const { state, dispatch } = useModel();
  const onClick = useCallback(() => {
    automationsController.deleteItem(props.record.id).then(() => {
      fetchList(state, dispatch);
      noticeBg({
        action: APP_ACTIONS.AUTOMATION_UPDATED,
        data: {
          type: "delete",
          old: props.record,
        },
      });
    });
  }, []);

  return (
    <span onClick={onClick}>
      <DeleteOutlined translate="no" />
    </span>
  );
}

function fetchList(state, dispatch) {
  return automationsController.getList().then((res: Response) => {
    if (res.code === 0) {
      dispatch({
        type: ACTIONS.AUTOMATIONS,
        payload: matchAutomations(res.data, state.tab.url),
      });
    }
  });
}

const scopeOptions = [
  {
    label: "Local",
    value: "local",
  },
  {
    label: "Global",
    value: "global",
  },
];

function EmptyAutomationsState(props: {
  state: PageState;
  dispatch: React.Dispatch<any>;
}) {
  const { state, dispatch } = props;
  const [adding, setAdding] = useState(false);
  const onAddExample = () => {
    setAdding(true);
    automationsController
      .saveAutomation(
        "",
        EXAMPLE_AUTOMATION_SCRIPT,
        EXAMPLE_AUTOMATION_PATTERN,
        RunAtEnum.END,
        EXAMPLE_AUTOMATION_NAME,
        undefined
      )
      .then((res: Response) => {
        if (res.code === 0) {
          fetchList(state, dispatch);
          noticeBg({ action: PAGE_ACTIONS.REFRESH_AUTOMATIONS });
          message.success(t("example_added_message"));
        }
        setAdding(false);
      });
  };
  const onAddAutomation = () => {
    dispatch({
      type: ACTIONS.AUTOMATION_FORM_UPDATE,
      payload: { instructions: "", pattern: "" },
    });
  };
  return (
    <div className="am-empty-state">
      <div className="am-empty-state-title">{t("empty_automations_title")}</div>
      <div className="am-empty-state-desc">{t("empty_automations_desc")}</div>
      <div className="am-empty-state-actions">
        <Button
          type="primary"
          size="small"
          loading={adding}
          onClick={onAddExample}
          style={{ marginRight: 8 }}
        >
          {t("add_example_automation")}
        </Button>
        <Button size="small" onClick={onAddAutomation}>
          {t("add_automation")}
        </Button>
      </div>
    </div>
  );
}

function Automations(props: any) {
  const { host } = props;
  const { state, dispatch } = useContext(PageContext);
  const [scope, setScope] = useState<"local" | "global">("local");
  const onChange = ({ target: { value } }: RadioChangeEvent) => {
    setScope(value);
  };
  const list = useMemo(() => {
    return state.automations.filter((item) => {
      if (scope === "local") {
        return item.pattern !== "*";
      } else {
        return item.pattern === "*";
      }
    });
  }, [scope, state.automations]);

  useEffect(() => {
    fetchList(state, dispatch);
  }, [host, state.amFormEditing]);

  return (
    <div>
      <Radio.Group
        value={scope}
        options={scopeOptions}
        onChange={onChange}
        optionType="button"
      />
      <Table
        columns={AutomationsColumns}
        dataSource={list}
        rowKey="id"
        pagination={false}
        size="small"
        locale={{
          emptyText: (
            <EmptyAutomationsState state={state} dispatch={dispatch} />
          ),
        }}
      />
    </div>
  );
}
