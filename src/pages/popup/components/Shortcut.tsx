import Button from "antd/es/button";
import ButtonGroup from "antd/es/button/button-group";
import Input from "antd/es/input";
import Select from "antd/es/select";
import Table from "antd/es/table";
import * as React from "react";
import { useCallback, useContext, useEffect, useState } from "react";

import {
  DeleteOutlined,
  EditOutlined,
  PlusSquareOutlined,
} from "@ant-design/icons";
import { t } from "@src/helper/i18n.helper";
import { matchAutomations } from "../../../helper/automations";
import { noticeBg } from "../../../helper/event";
import Response from "../../../server/common/response";
import * as shortcutsController from "../../../server/controller/shortcuts.controller";
import * as automationsController from "../../../server/controller/automations.controller";
import {
  ACTIONS,
  PageContext,
  useModel,
} from "../../../store/modules/popup.store";
import { IShortcut } from "@src/server/db/database";

export function ShortcutsPanel() {
  const { state, dispatch } = useContext(PageContext);
  const { scFormEditing } = state;
  return (
    <div>
      {scFormEditing ? (
        <ShortcutEditor />
      ) : (
        <ButtonGroup style={{ marginBottom: "10px" }}>
          <MenuBtn
            onClick={() =>
              dispatch({
                type: ACTIONS.SHORTCUT_FORM_UPDATE,
                payload: {
                  name: "",
                  aid: "",
                  wid: "",
                  shortcut: "",
                  action: "",
                },
              })
            }
            icon={
              <PlusSquareOutlined
                style={{ fontSize: "20px", cursor: "pointer" }}
                translate="no"
              />
            }
            styles={{ marginLeft: "10px" }}
            label={t("add_new_shortcut")}
          />
        </ButtonGroup>
      )}
      <Shortcuts />
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

function validateScForm(
  shortcut: string,
  aid?: number,
  wid?: number,
  action?: string
) {
  if (shortcut && (aid || wid || action)) {
    return true;
  } else {
    return false;
  }
}

function onScFormChange(attrs, dispatch) {
  dispatch({ type: ACTIONS.SHORTCUT_FORM_UPDATE, payload: attrs });
}

function ShortcutEditor() {
  const { state, dispatch } = useContext(PageContext);
  const { shortcutForm: form } = state;
  const [saving, setSaving] = useState(false);

  function onScEditorSaveClick() {
    const { shortcut, aid, wid, action, name } = form;

    if (validateScForm(shortcut, aid, wid, action)) {
      setSaving(true);
      shortcutsController
        .saveShortcut(shortcut, aid, wid, action, name, form.id)
        .then((resp) => {
          if (resp.code === 0) {
            setSaving(false);
            dispatch({ type: ACTIONS.SHORTCUT_FORM_CLOSE, payload: null });
            // noticeBg({ action: PAGE_ACTIONS.REFRESH_AUTOMATIONS, });
          }
        });
    }
  }

  function onScEditorCancleClick() {
    dispatch({ type: ACTIONS.SHORTCUT_FORM_CLOSE, payload: null });
  }

  return (
    <div className="am-editor">
      <div>
        <Input.Group compact>
          <Input
            placeholder={"such as: a + b"}
            value={form.shortcut}
            className="ipt-shortcut"
            style={{ width: 150 }}
            onChange={(event) => {
              onScFormChange(
                {
                  shortcut: event.target.value,
                },
                dispatch
              );
            }}
          />
          <Input
            placeholder="ID of automation"
            style={{ width: 150 }}
            onChange={(event) => {
              onScFormChange(
                {
                  aid: event.target.value,
                },
                dispatch
              );
            }}
            value={form.aid}
          />
          <Input
            placeholder="name"
            style={{ width: 150 }}
            onChange={(event) => {
              onScFormChange(
                {
                  name: event.target.value,
                },
                dispatch
              );
            }}
            value={form.name}
          />
        </Input.Group>
      </div>
      <div className="am-editor-btns">
        <Button
          onClick={() => onScEditorCancleClick()}
          style={{ marginRight: "10px" }}
        >
          {t("cancel")}
        </Button>
        <Button disabled={saving} onClick={() => onScEditorSaveClick()}>
          {t("save")}
        </Button>
      </div>
    </div>
  );
}

const ShortcutsColumns = [
  {
    title: t("shortcut"),
    dataIndex: "shortcut",
    width: "180px",
  },
  {
    title: t("id_of_automation"),
    dataIndex: "aid",
  },
  {
    title: t("name"),
    dataIndex: "name",
    width: "180px",
  },
  {
    title: t("operation"),
    width: "120px",
    render: (text, record) => <OpBtns record={record} />,
  },
];

function DeleteBtn(props: { record: IShortcut }) {
  const { state, dispatch } = useModel();
  const onClick = useCallback(() => {
    shortcutsController.deleteItem(props.record.id).then(() => {
      fetchList(state, dispatch);
    });
  }, []);

  return (
    <span onClick={onClick}>
      <DeleteOutlined translate="no" />
    </span>
  );
}

function OpBtns(props: { record: IShortcut }) {
  return (
    <div className="op-btns" style={{ minWidth: "120px" }}>
      <EditBtn record={props.record} />
      <DeleteBtn record={props.record} />
    </div>
  );
}

function EditBtn(props: { record: IShortcut }) {
  const { dispatch } = useModel();
  const onClick = useCallback(() => {
    const record = props.record;
    dispatch({ type: ACTIONS.SHORTCUT_FORM_UPDATE, payload: record });
  }, []);

  return (
    <span onClick={onClick}>
      <EditOutlined translate="no" />
    </span>
  );
}

async function fetchList(state, dispatch) {
  const { data } = await automationsController.getList();
  const aids = matchAutomations(data, state.tab.url).map((item) => item.id);

  return shortcutsController.queryByAids(aids).then((res: Response) => {
    if (res.code === 0) {
      dispatch({
        type: ACTIONS.SHORTCUTS,
        payload: res.data,
      });
    }
  });
}

function Shortcuts(props: any) {
  const { host } = props;
  const { state, dispatch } = useContext(PageContext);

  useEffect(() => {
    fetchList(state, dispatch);
  }, [host, state.scFormEditing]);

  return (
    <div>
      <Table
        columns={ShortcutsColumns}
        dataSource={state.shortcuts}
        pagination={false}
        size="small"
      ></Table>
    </div>
  );
}
