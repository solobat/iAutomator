import { Tooltip } from "antd";
import Table, { ColumnsType } from "antd/es/table";
import * as React from "react";
import { useContext, useEffect, useState } from "react";

import { PlayCircleOutlined, PlusCircleOutlined } from "@ant-design/icons";
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

const RecordsColumns: ColumnsType = [
  { title: t("action"), dataIndex: "content", ellipsis: true },
  {
    title: t("path"),
    dataIndex: "url",
    render: (text) => <span>{getPath(text)}</span>,
    ellipsis: true,
  },
  {
    title: t("operation"),
    width: "100px",
    render: (text, record) => <RecordOpBtns record={record} />,
  },
];

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
      <PlayCircleOutlined
        translate="no"
        rev=""
        onClick={() => onRecordRunClick(props.record, id)}
      />
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
      <PlusCircleOutlined
        translate="no"
        rev=""
        onClick={() => onRecordAddAmClick(props.record, dispatch)}
      />
    </Tooltip>
  );
}

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
      <Table
        columns={RecordsColumns}
        dataSource={list}
        pagination={false}
        size="small"
      ></Table>
    </div>
  );
}
