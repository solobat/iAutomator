import { useEffect, useState } from "react";
import * as notesController from "@src/server/controller/notes.controller";
import { OK } from "@src/server/common/code";
import { DeleteOutlined } from "@ant-design/icons";
import { List, Table } from "antd";
import dayjs from "dayjs";
import { INote } from "@src/server/db/database";
import Column from "antd/lib/table/Column";

export function Notes() {
  const [list, setList] = useState([]);
  const onDelete = (id: number) => {
    notesController.deleteItem(id).then(() => {
      fetch();
    });
  };

  function fetch() {
    notesController.list().then((resp) => {
      if (resp.code === OK.code) {
        setList(resp.data);
      }
    });
  }

  useEffect(() => {
    fetch();
  }, []);

  return (
    <div>
      <Table<INote>
        rowKey="id"
        size="small"
        dataSource={list}
        expandable={{
          expandedRowRender: (record) => <NoteComments nid={record.id} />,
        }}
      >
        <Column key="id" dataIndex="id" title="ID" width="150px" />
        <Column<INote>
          key="path"
          dataIndex="path"
          title="Link"
          width="100px"
          render={(path: string, record) => (
            <a
              target="_blank"
              rel="noreferrer"
              href={`https://${record.domain}${path}`}
            >
              Link
            </a>
          )}
        />
        <Column key="content" dataIndex="content" title="Content" />
        <Column
          key="createTime"
          dataIndex="createTime"
          title="Date"
          width="100px"
          render={(value: number) => dayjs(value).format("YYYY-MM-DD")}
        />
        <Column<INote>
          key="options"
          title="Options"
          width={100}
          render={(_, record) => (
            <DeleteOutlined onClick={() => onDelete(record.id)} />
          )}
        />
      </Table>
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
