import * as React from "react";
import { useState, useEffect, useContext } from "react";
import { PageContext, ACTIONS } from "../../../store/modules/popup.store";
import * as recordsController from "../../../server/controller/records.controller";
import Response from "../../../server/common/response";
import Table, { ColumnsType } from "antd/es/table";
import { PlayCircleOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { AutomationForm } from "../../../common/types";
import { getPath } from "../../../helper/url";
import { noticeBg } from "../../../helper/event";
import { PAGE_ACTIONS } from "../../../common/const";
import { t } from "@src/helper/i18n.helper";
import { Tooltip } from "antd";
import { basicInstruction } from "@src/helper/instruction";

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
        onClick={() => onRecordRunClick(props.record, id)}
      />
    </Tooltip>
  );
}

function onRecordAddAmClick(record, dispatch) {
  const data = basicInstruction.parse(record.content);
  const payload: AutomationForm = {
    pattern: record.url,
    action: data.action,
    args: data.rawArgs,
    scope: data.scope,
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
