import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import { AddCircleOutline, PlayCircleOutline } from "@mui/icons-material";
import * as React from "react";
import { useContext, useEffect, useState } from "react";

import { t } from "@src/helper/i18n.helper";
import { basicInstruction } from "@src/helper/instruction";

import { PAGE_ACTIONS } from "../../../common/const";
import { AutomationForm } from "../../../common/types";
import { noticeBg } from "../../../helper/event";
import { getPath } from "../../../helper/url";
import Response from "../../../server/common/response";
import * as recordsController from "../../../server/controller/records.controller";
import { ACTIONS, PageContext } from "../../../store/modules/popup.store";

interface RecordsProps {
  host: string;
}

function onRecordRunClick(item, tabId) {
  noticeBg({
    action: PAGE_ACTIONS.EXEC_INSTRUCTIONS,
    data: {
      tabId,
      instructions: item.content,
    },
  });
}

function RecordOpBtns(props: any) {
  return (
    <div className="record-op-btns">
      <RunBtn record={props.record} />
      <AddAmBtn record={props.record} />
    </div>
  );
}

function RunBtn(props: any) {
  const { state } = useContext(PageContext);
  const { id } = state.tab;

  return (
    <Tooltip title={t("redo")}>
      <PlayCircleOutline onClick={() => onRecordRunClick(props.record, id)} />
    </Tooltip>
  );
}

function onRecordAddAmClick(record, dispatch) {
  const data = basicInstruction.parse(record.content);
  const payload: AutomationForm = {
    pattern: record.url,
    data: [{ action: data.action, rawArgs: data.rawArgs, scope: data.scope }],
    instructions: record.content,
  };
  dispatch({ type: ACTIONS.TAB_CHANGE, payload: "automation" });
  dispatch({ type: ACTIONS.AUTOMATION_FORM_UPDATE, payload });
}

function AddAmBtn(props: any) {
  const { dispatch } = useContext(PageContext);

  return (
    <Tooltip title={t("as_automation")}>
      <AddCircleOutline
        onClick={() => onRecordAddAmClick(props.record, dispatch)}
      />
    </Tooltip>
  );
}

const ellipsisCell = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
  maxWidth: 260,
} as const;

export function Records(props: RecordsProps) {
  const { host } = props;
  const [list, setList] = useState([]);

  useEffect(() => {
    recordsController.query({ domain: host }).then((res: Response) => {
      if (res.code === 0) {
        setList(res.data);
      }
    });
  }, [host]);
  return (
    <div>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t("action")}</TableCell>
              <TableCell>{t("path")}</TableCell>
              <TableCell sx={{ width: 100 }}>{t("operation")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {list.map((record, index) => (
              <TableRow key={index}>
                <TableCell sx={ellipsisCell}>{record.content}</TableCell>
                <TableCell sx={ellipsisCell}>{getPath(record.url)}</TableCell>
                <TableCell>
                  <RecordOpBtns record={record} />
                </TableCell>
              </TableRow>
            ))}
            {list.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  <Typography variant="body2" color="text.secondary">
                    No data
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}
