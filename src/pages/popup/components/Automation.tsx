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
} from "@ant-design/icons";
import { matchAutomations } from "../../../helper/automations";
import { noticeBg } from "../../../helper/event";
import { PAGE_ACTIONS } from "../../../common/const";

const { Option } = Select;

export function AutomationsPanel() {
  const { state, dispatch } = useContext(PageContext);
  const { amFormEditing } = state;
  return (
    <div>
      {amFormEditing ? (
        <AutomationEditor />
      ) : (
        <span
          onClick={() =>
            dispatch({
              type: ACTIONS.AUTOMATION_FORM_UPDATE,
              payload: { instructions: "", pattern: "" },
            })
          }
        >
          <PlusSquareOutlined
            style={{ fontSize: "20px", cursor: "pointer" }}
            translate="no"
          />
        </span>
      )}
      <Automations />
    </div>
  );
}

function validateAmForm(form) {
  const { instructions, pattern } = form;
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

  function onAmEditorSaveClick() {
    if (validateAmForm(form)) {
      setSaving(true);
      automationsController
        .saveAutomation(form.instructions, form.pattern, form.runAt, form.id)
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
      <div className="am-editor-fields">
        <Input
          placeholder="Instructions"
          value={form.instructions}
          className="ipt-ins"
          onChange={(event) => {
            onAmFormChange(
              {
                instructions: event.target.value,
              },
              dispatch
            );
          }}
        />
        <Input
          placeholder="Pattern"
          value={form.pattern}
          className="ipt-pattern"
          onChange={(event) => {
            onAmFormChange(
              {
                pattern: event.target.value,
              },
              dispatch
            );
          }}
        />
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
        >
          <Option value={0}>Immediately</Option>
          <Option value={1}>DomReady</Option>
          <Option value={2}>Delayed</Option>
        </Select>
      </div>
      <div className="am-editor-btns">
        <Button
          onClick={() => onAmEditorCancleClick()}
          style={{ marginRight: "10px" }}
        >
          Cancel
        </Button>
        <Button disabled={saving} onClick={() => onAmEditorSaveClick()}>
          Save
        </Button>
      </div>
    </div>
  );
}

const AutomationsColumns = [
  {
    title: "Instructions",
    dataIndex: "instructions",
    width: "300px",
    textWrap: "word-break",
    ellipsis: true,
  },
  { title: "Pattern", dataIndex: "pattern" },
  {
    title: "RunAt",
    dataIndex: "runAt",
    render: (runAt, record) => <RunAt record={record} />,
  },
  {
    title: "Operation",
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
      <Option value={0}>Immediately</Option>
      <Option value={1}>DomReady</Option>
      <Option value={2}>Delayed</Option>
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
    dispatch({ type: ACTIONS.AUTOMATION_FORM_UPDATE, payload: props.record });
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
