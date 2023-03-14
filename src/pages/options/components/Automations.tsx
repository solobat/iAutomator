import { t } from "@src/helper/i18n.helper";
import Response from "@src/server/common/response";
import * as automationsController from "@src/server/controller/automations.controller";
import Select from "antd/es/select";
import Table from "antd/es/table";
import { useEffect, useState } from "react";
import { DeleteOutlined } from "@ant-design/icons";
import { IAutomation } from "@src/server/db/database";
import Column from "antd/es/table/Column";
import Search from "antd/es/input/Search";

const Option = Select.Option;
export function Automations() {
  const [list, setList] = useState([]);
  const onSearch = (domain: string) => {
    fetchList().then((list) =>
      setList(
        domain ? list.filter((item) => item.pattern.indexOf(domain) > -1) : list
      )
    );
  };
  const onDeleted = () => {
    fetchList().then(setList);
  };
  useEffect(() => {
    fetchList().then(setList);
  }, []);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Search
          onSearch={onSearch}
          style={{ width: "500px" }}
          placeholder="twitter.com"
        />
      </div>
      <Table<IAutomation> dataSource={list} rowKey="id" size="small">
        <Column title="ID" dataIndex="id" width="50px" />
        <Column
          title={t("instructions")}
          dataIndex="instructions"
          width="180px"
          ellipsis
        />
        <Column
          title={t("pattern")}
          dataIndex="pattern"
          width="180px"
          ellipsis
        />
        <Column<IAutomation>
          title={t("run_at")}
          dataIndex="runAt"
          width="50px"
          render={(runAt, record) => <RunAt record={record} />}
        />
        <Column<IAutomation>
          title={t("operation")}
          dataIndex="operation"
          width="50px"
          render={(text, record) => (
            <OpBtns onDeleted={onDeleted} record={record} />
          )}
        />
      </Table>
    </div>
  );
}

function fetchList(): Promise<IAutomation[]> {
  return automationsController.getList().then((res: Response) => {
    return res.data ?? [];
  });
}

function RunAt(props: { record: IAutomation }) {
  return (
    <Select value={props.record.runAt} disabled>
      <Option value={0}>{t("run_at_immediately")}</Option>
      <Option value={1}>{t("run_at_dom_ready")}</Option>
      <Option value={2}>{t("run_at_delayed")}</Option>
    </Select>
  );
}

function OpBtns(props: { onDeleted: () => void; record: IAutomation }) {
  return (
    <div className="op-btns" style={{ minWidth: "120px" }}>
      <DeleteBtn onDeleted={props.onDeleted} record={props.record} />
    </div>
  );
}

function DeleteBtn(props: { record: IAutomation; onDeleted: () => void }) {
  const onClick = () => {
    automationsController.deleteItem(props.record.id).then(() => {
      props.onDeleted();
    });
  };

  return (
    <span onClick={onClick}>
      <DeleteOutlined translate="no" />
    </span>
  );
}
