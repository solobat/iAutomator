import * as React from "react";
import { useState, useEffect, useContext, useCallback } from "react";
import {
  PageContext,
  ACTIONS,
  useModel,
} from "../../../store/modules/popup.store";
import * as automationsController from "../../../server/controller/automations.controller";
import Response from "../../../server/common/response";
import Table from "antd/es/table";
import Button from "antd/es/button";
import Input from "antd/es/input";
import Switch from "antd/es/switch";
import Select from "antd/es/select";
import {
  PlusSquareOutlined,
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { matchAutomations } from "../../../helper/automations";
import { noticeBg } from "../../../helper/event";
import { PlayCircleOutlined } from "@ant-design/icons";
import {
  BUILDIN_ACTIONS,
  BUILDIN_ACTION_FIELD_CONFIGS,
  PAGE_ACTIONS,
} from "../../../common/const";
import ButtonGroup from "antd/es/button/button-group";
import { t } from "@src/helper/i18n.helper";
import { getURLPatterns } from "@src/helper/url";
import { AutoComplete, Tooltip } from "antd";
import { list2options } from "@src/helper/antd";
import { basicInstruction } from "@src/helper/instruction";

const { Option } = Select;

export function AutomationsPanel() {
  const { state, dispatch } = useContext(PageContext);
  const { amFormEditing } = state;
  return (
    <div>
      {amFormEditing ? (
        <AutomationEditor />
      ) : (
        <ButtonGroup style={{ marginBottom: "10px" }}>
          <MenuBtn
            onClick={() =>
              chrome.tabs.create({ url: "https://ihelpers.xyz/automations" })
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
            label={t("add_new_automation")}
          />
        </ButtonGroup>
      )}
      <Automations />
    </div>
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
      style={{ display: "flex", alignItems: "center", ...props.styles }}
      icon={props.icon}
    >
      {props.label}
    </Button>
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
  const { automationForm: form } = state;
  const [saving, setSaving] = useState(false);
  const urlPatterns = getURLPatterns(state.tab.hostname, state.tab.pathname);
  const actionItem = BUILDIN_ACTION_FIELD_CONFIGS.find(
    (item) => item.value === form.action
  );
  const argsTips =
    actionItem?.args?.map((arg) => `${arg.name}!${arg.type}`).join("^") ||
    "No Args";
  function onAmEditorSaveClick() {
    const { pattern, action, scope, args } = form;
    const instructions = basicInstruction.generate({
      action,
      args: basicInstruction.argsHandler.parse(args, action),
      scope,
      rawArgs: args,
    });

    if (validateAmForm(instructions, pattern)) {
      setSaving(true);
      automationsController
        .saveAutomation(instructions, pattern, form.runAt, form.id)
        .then((resp) => {
          if (resp.code === 0) {
            setSaving(false);
            dispatch({ type: ACTIONS.AUTOMATION_FORM_CLOSE, payload: null });
            noticeBg({
              action: PAGE_ACTIONS.REFRESH_AUTOMATIONS,
            });
          }
        });
    }
  }

  function onAmEditorCancleClick() {
    dispatch({ type: ACTIONS.AUTOMATION_FORM_CLOSE, payload: null });
  }

  return (
    <div className="am-editor">
      <div>
        <Input.Group compact>
          <Select
            style={{ width: 150 }}
            value={form.action}
            defaultValue={BUILDIN_ACTIONS.READ_MODE}
            onChange={(value) => {
              onAmFormChange(
                {
                  action: value,
                },
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
            value={form.args}
            className="ipt-ins"
            style={{ width: 382 }}
            prefix={<Tooltip title={argsTips}>?</Tooltip>}
            onChange={(event) => {
              onAmFormChange(
                {
                  args: event.target.value,
                },
                dispatch
              );
            }}
          />
          <Input
            prefix="@"
            placeholder="scope"
            onChange={(event) => {
              onAmFormChange(
                {
                  scope: event.target.value,
                },
                dispatch
              );
            }}
            value={form.scope}
            style={{ width: 150 }}
          />
        </Input.Group>
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

const AutomationsColumns = [
  {
    title: t("instructions"),
    dataIndex: "instructions",
    width: "300px",
    textWrap: "word-break",
    ellipsis: true,
  },
  { title: t("pattern"), dataIndex: "pattern" },
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
    <div className="op-btns" style={{ minWidth: "120px" }}>
      <SwitchBtn record={props.record} />
      <EditBtn record={props.record} />
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
          noticeBg({ action: PAGE_ACTIONS.REFRESH_AUTOMATIONS });
        });
      });
  }, []);

  return (
    <Switch size="small" checked={props.record.active} onChange={onChange} />
  );
}

function EditBtn(props: any) {
  const { state, dispatch } = useModel();
  const onClick = useCallback(() => {
    const data = basicInstruction.parse(props.record.instructions);
    const record = {
      ...props.record,
      action: data.action,
      args: basicInstruction.argsHandler.stringify(data.args, data.action),
      scope: data.scope,
    };
    dispatch({ type: ACTIONS.AUTOMATION_FORM_UPDATE, payload: record });
  }, []);

  return (
    <span onClick={onClick}>
      <EditOutlined translate="no" />
    </span>
  );
}

function DeleteBtn(props: any) {
  const { state, dispatch } = useModel();
  const onClick = useCallback(() => {
    automationsController.deleteItem(props.record.id).then(() => {
      fetchList(state, dispatch);
      noticeBg({
        action: PAGE_ACTIONS.REFRESH_AUTOMATIONS,
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

function Automations(props: any) {
  const { host } = props;
  const { state, dispatch } = useContext(PageContext);

  useEffect(() => {
    fetchList(state, dispatch);
  }, [host, state.amFormEditing]);

  return (
    <div>
      <Table
        columns={AutomationsColumns}
        dataSource={state.automations}
        pagination={false}
        size="small"
      ></Table>
    </div>
  );
}
