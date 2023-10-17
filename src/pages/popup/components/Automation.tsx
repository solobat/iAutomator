import { Alert, AutoComplete, Popover, Radio, RadioChangeEvent } from "antd";
import Button from "antd/es/button";
import ButtonGroup from "antd/es/button/button-group";
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
  SearchOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";
import { PlayCircleOutlined } from "@ant-design/icons";
import { list2options } from "@src/helper/antd";
import { t } from "@src/helper/i18n.helper";
import {
  basicArgsHandler,
  basicInstruction,
  InstructionData,
} from "@src/helper/instruction";
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

function Buttons() {
  const { dispatch } = useContext(PageContext);

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
            rev=""
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
            rev=""
            style={{ fontSize: "20px", cursor: "pointer" }}
            translate="no"
          />
        }
        styles={{ marginLeft: "10px" }}
        label={t("add_new_automation")}
      />

      <MenuBtn
        onClick={() =>
          dispatch({
            type: ACTIONS.AUTOMATION_FORM_UPDATE,
            payload: {},
            editingMode: AmFormEditing.Script,
          })
        }
        icon={
          <PlusSquareOutlined
            rev=""
            style={{ fontSize: "20px", cursor: "pointer" }}
            translate="no"
          />
        }
        styles={{ marginLeft: "10px" }}
        label={t("add_new_script")}
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
automation for "https://weibo.com/*" on "load"
  set excludes = ".Frame_wrap_16as0"
  apply "readMode" with (excludes=excludes)  on "#homeWrap"
end
`;

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
      const result = parseScript(scripts);
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
      automationsController
        .saveAutomation(
          "",
          scripts,
          result[0].pattern,
          result[0].runAt,
          "New Script",
          form.id
        )
        .then((resp) => {
          if (resp.code === 0) {
            setSaving(false);
            dispatch({ type: ACTIONS.AUTOMATION_FORM_CLOSE, payload: null });
            noticeBg({
              action: PAGE_ACTIONS.REFRESH_AUTOMATIONS,
            });
          }
        });
    } else {
      setSaving(false);
    }
  };

  return (
    <div>
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
  const urlPatterns = getURLPatterns(state.tab.host, state.tab.pathname);
  const boxRef = React.useRef<HTMLDivElement>(null);

  function onAmEditorSaveClick() {
    const { pattern, data } = form;
    const instructions = data
      .map((item) => {
        return basicInstruction.generate({
          action: item.action,
          args: basicInstruction.argsHandler.parse(item.rawArgs, item.action),
          scope: item.scope,
          rawArgs: item.rawArgs,
        });
      })
      .join(";");

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

  return (
    <div className="am-editor" ref={boxRef}>
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
          suffixIcon={<PlayCircleOutlined rev="" />}
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

function ActionArgField(props: { arg: ActionArg }) {
  const { arg } = props;

  return (
    <>
      {arg.type === "boolean" && (
        <Form.Item
          label={arg.name}
          name={arg.name}
          valuePropName="checked"
          required={arg.required}
        >
          <Switch title={arg.tips} defaultChecked={arg.defaultValue === true} />
        </Form.Item>
      )}
      {arg.type === "string" &&
        (arg.optionalValues ? (
          <Form.Item label={arg.name} name={arg.name} required={arg.required}>
            <Select>
              {arg.optionalValues.map((item, index) => (
                <Option value={item} key={index}>
                  {item}
                </Option>
              ))}
            </Select>
          </Form.Item>
        ) : (
          <Form.Item label={arg.name} name={arg.name} required={arg.required}>
            <Input
              placeholder={arg.tips}
              defaultValue={arg.defaultValue as string}
              suffix={arg.suffix}
            />
          </Form.Item>
        ))}
      {arg.type === "number" && (
        <Form.Item label={arg.name} name={arg.name} required={arg.required}>
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
  form: Omit<InstructionData, "args">;
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
        placeholder={"key1!val1^key2!val2..."}
        value={form.rawArgs}
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
                defaultValues={basicArgsHandler.parse(
                  form.rawArgs,
                  actionItem?.value
                )}
                onChange={(_, values) =>
                  onArgsChange(actionItem?.value, values)
                }
              />
            }
          >
            <EditOutlined rev="" />
          </Popover>
        }
        onChange={(event) => {
          onAmFormInsChange(
            {
              rawArgs: event.target.value,
            },
            props.index,
            dispatch
          );
        }}
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
        <PlusSquareOutlined rev="" size={25} onClick={onAddNewInsClick} />
        <MinusSquareOutlined
          rev=""
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
    title: t("instructions"),
    dataIndex: "instructions",
    width: "150px",
    textWrap: "word-break",
    ellipsis: true,
  },
  {
    title: t("scripts"),
    dataIndex: "scripts",
    width: "150px",
    textWrap: "word-break",
    ellipsis: true,
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
      suffix={
        !editable && <EditFilled rev={""} onClick={() => setEditable(true)} />
      }
      onPressEnter={onEnter}
    ></Input>
  );
}

function RunAt(props: any) {
  const { state, dispatch } = useModel();
  const onChange = useCallback((value) => {
    props.record.runAt = value;
    automationsController
      .updateAutomation(props.record.id, {
        runAt: value,
      })
      .then(() => {
        fetchList(state, dispatch).then(() => {
          noticeBg({ action: PAGE_ACTIONS.REFRESH_AUTOMATIONS });
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
    const data = props.record.instructions
      .split(";")
      .map((item) => basicInstruction.parse(item));
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
      <EditOutlined rev="" translate="no" />
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
      <ShareAltOutlined rev="" translate="no" />
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
      <MacCommandOutlined rev="" translate="no" />
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
      <DeleteOutlined rev="" translate="no" />
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
      ></Table>
    </div>
  );
}
