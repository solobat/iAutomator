import { AutoComplete, Tooltip } from "antd";
import Button from "antd/es/button";
import ButtonGroup from "antd/es/button/button-group";
import Input from "antd/es/input";
import Select from "antd/es/select";
import Switch from "antd/es/switch";
import Table from "antd/es/table";
import * as React from "react";
import { useCallback, useContext, useEffect, useState } from "react";

import {
  DeleteOutlined,
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
import { basicInstruction, InstructionData } from "@src/helper/instruction";
import { getURLPatterns } from "@src/helper/url";
import { IAutomation } from "@src/server/db/database";
import Automation from "@src/server/model/Automation";

import {
  BUILDIN_ACTION_FIELD_CONFIGS,
  BUILDIN_ACTIONS,
  PAGE_ACTIONS,
} from "../../../common/const";
import { matchAutomations } from "../../../helper/automations";
import { noticeBg } from "../../../helper/event";
import Response from "../../../server/common/response";
import * as automationsController from "../../../server/controller/automations.controller";
import {
  ACTIONS,
  PageContext,
  PageState,
  useModel,
} from "../../../store/modules/popup.store";

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
  const form = state.automationForm as PageState["automationForm"];
  const [saving, setSaving] = useState(false);
  const urlPatterns = getURLPatterns(state.tab.hostname, state.tab.pathname);

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

function InstructionEditor(props: {
  form: Omit<InstructionData, "args">;
  index: number;
  dispatch;
}) {
  const { form, dispatch } = props;
  const actionItem = BUILDIN_ACTION_FIELD_CONFIGS.find(
    (item) => item.value === form.action
  );
  const argsTips =
    actionItem?.args?.map((arg) => `${arg.name}!${arg.type}`).join("^") ||
    "No Args";
  function onAddNewInsClick() {
    dispatch({
      type: ACTIONS.AUTOMATION_FORM_NEW_INS,
      payload: { index: props.index },
    });
  }
  function onDelInsClick() {
    dispatch({
      type: ACTIONS.AUTOMATION_FORM_DEL_INS,
      payload: { index: props.index },
    });
  }

  return (
    <Input.Group compact className="am-ins-editor">
      <Select
        style={{ width: 150 }}
        value={form.action}
        defaultValue={BUILDIN_ACTIONS.READ_MODE}
        onChange={(value) => {
          onAmFormInsChange(
            {
              action: value,
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
        style={{ width: 370 }}
        prefix={<Tooltip title={argsTips}>?</Tooltip>}
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
    title: "ID",
    dataIndex: "id",
    width: "50px",
  },
  {
    title: t("instructions"),
    dataIndex: "instructions",
    width: "180px",
    textWrap: "word-break",
    ellipsis: true,
  },
  {
    title: t("pattern"),
    dataIndex: "pattern",
    width: "180px",
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
          noticeBg({ action: PAGE_ACTIONS.REFRESH_AUTOMATIONS });
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
    dispatch({ type: ACTIONS.AUTOMATION_FORM_UPDATE, payload: record });
  }, []);

  return (
    <span onClick={onClick}>
      <EditOutlined translate="no" />
    </span>
  );
}

function getShareURL(item: Automation) {
  const { instructions, runAt, pattern } = item;

  return `https://ihelpers.xyz/create?instructions=${encodeURIComponent(
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
