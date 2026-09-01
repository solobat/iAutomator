import {
  Button,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
} from "@mui/material";
import { AddBox, Delete, Edit } from "@mui/icons-material";
import * as React from "react";
import { useCallback, useContext, useEffect, useState } from "react";

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
        <Stack direction="row" spacing={1} sx={{ marginBottom: "10px" }}>
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
            icon={<AddBox sx={{ fontSize: "20px", cursor: "pointer" }} />}
            label={t("add_new_shortcut")}
          />
        </Stack>
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
      startIcon={props.icon}
      sx={{ display: "flex", borderRadius: "6px", ...props.styles }}
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
      <Stack direction="row" spacing={1}>
        <TextField
          placeholder={"such as: a + b"}
          value={form.shortcut}
          className="ipt-shortcut"
          size="small"
          sx={{ width: 150 }}
          onChange={(event) => {
            onScFormChange(
              {
                shortcut: event.target.value,
              },
              dispatch
            );
          }}
        />
        <TextField
          placeholder="ID of automation"
          size="small"
          sx={{ width: 150 }}
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
        <TextField
          placeholder="name"
          size="small"
          sx={{ width: 150 }}
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
      </Stack>
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

const ellipsisCell = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  maxWidth: 260,
} as const;

function DeleteBtn(props: { record: IShortcut }) {
  const { state, dispatch } = useModel();
  const onClick = useCallback(() => {
    shortcutsController.deleteItem(props.record.id).then(() => {
      fetchList(state, dispatch);
    });
  }, []);

  return (
    <IconButton size="small" onClick={onClick} title={t("operation")}>
      <Delete fontSize="small" />
    </IconButton>
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
    <Tooltip title={t("operation")}>
      <IconButton size="small" onClick={onClick}>
        <Edit fontSize="small" />
      </IconButton>
    </Tooltip>
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
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: "180px" }}>{t("shortcut")}</TableCell>
              <TableCell>{t("id_of_automation")}</TableCell>
              <TableCell sx={{ width: "180px" }}>{t("name")}</TableCell>
              <TableCell sx={{ width: "120px" }}>{t("operation")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {state.shortcuts.map((record) => (
              <TableRow key={record.id}>
                <TableCell sx={ellipsisCell}>{record.shortcut}</TableCell>
                <TableCell>{record.aid}</TableCell>
                <TableCell sx={ellipsisCell}>{record.name}</TableCell>
                <TableCell>
                  <OpBtns record={record} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
