import { useEffect, useState } from "react";
import * as notesController from "@src/server/controller/notes.controller";
import { OK } from "@src/server/common/code";
import { List, Table, TableColumnsType } from "antd";
import dayjs from "dayjs";
import { INote } from "@src/server/db/database";

const columns: TableColumnsType<INote> = [
  {
    key: "id",
    dataIndex: "id",
    title: "ID",
  },
  {
    key: "path",
    dataIndex: "path",
    title: "Link",
    render: (path: string, record) => (
      <a
        target="_blank"
        rel="noreferrer"
        href={`https://${record.domain}${path}`}
      >
        Link
      </a>
    ),
  },
  {
    key: "content",
    dataIndex: "content",
    title: "Content",
  },
  {
    key: "createTime",
    dataIndex: "createTime",
    title: "Date",
    render: (value: number) => dayjs(value).format("YYYY-MM-DD"),
  },
];
export function Notes() {
  const [list, setList] = useState([]);

  useEffect(() => {
    notesController.list().then((resp) => {
      if (resp.code === OK.code) {
        setList(resp.data);
      }
    });
  }, []);
  return (
    <div>
      <Table<INote>
        columns={columns}
        rowKey="id"
        size="small"
        dataSource={list}
        expandable={{
          expandedRowRender: (record) => <NoteComments nid={record.id} />,
        }}
      ></Table>
    </div>
  );
}

function NoteComments(props: { nid: number }) {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    notesController.query({ nid: props.nid }).then((resp) => {
      if (resp.code === OK.code) {
        console.log("comments: ", resp.data);
        setComments(resp.data);
      }
    });
  }, [props.nid]);

  return (
    <List<INote>
      dataSource={comments}
      renderItem={(record) => <List.Item>{record.content}</List.Item>}
    ></List>
  );
}
