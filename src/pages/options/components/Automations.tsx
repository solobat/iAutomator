import { t } from "@src/helper/i18n.helper";
import Response from "@src/server/common/response";
import * as automationsController from "@src/server/controller/automations.controller";
import { APP_ACTIONS, PAGE_ACTIONS } from "@src/common/const";
import { noticeBg } from "@src/helper/event";
import { readFileAsText, downloadJson } from "@src/helper/file.helper";
import Select from "antd/es/select";
import Table from "antd/es/table";
import Button from "antd/es/button";
import Upload from "antd/es/upload";
import message from "antd/es/message";
import { useEffect, useState } from "react";
import { DeleteOutlined, DownloadOutlined, UploadOutlined } from "@ant-design/icons";
import { IAutomation } from "@src/server/db/database";
import Column from "antd/es/table/Column";
import Search from "antd/es/input/Search";

const Option = Select.Option;

const EXPORT_VERSION = 1;

function toExportItem(record: IAutomation) {
  return {
    name: record.name,
    pattern: record.pattern,
    instructions: record.instructions ?? "",
    scripts: record.scripts ?? "",
    runAt: record.runAt ?? 1,
  };
}

function exportOne(record: IAutomation) {
  const name = (record.name || "automation").replace(/[^\w\u4e00-\u9fa5-]/g, "_");
  downloadJson(
    { version: EXPORT_VERSION, automation: toExportItem(record) },
    `automation-${name}.json`
  );
}

function exportAll(list: IAutomation[]) {
  downloadJson(
    { version: EXPORT_VERSION, automations: list.map(toExportItem) },
    "automations.json"
  );
}

async function importFromFile(file: File): Promise<number> {
  const text = await readFileAsText(file);
  const data = JSON.parse(text);
  let items: Array<{ name?: string; pattern: string; instructions: string; scripts: string; runAt?: number }>;
  if (Array.isArray(data)) {
    items = data;
  } else if (data.automations && Array.isArray(data.automations)) {
    items = data.automations;
  } else if (data.automation && typeof data.automation === "object") {
    items = [data.automation];
  } else {
    throw new Error("Invalid format");
  }
  let count = 0;
  for (const item of items) {
    if (!item || typeof item.pattern !== "string") continue;
    await automationsController.saveAutomation(
      item.instructions ?? "",
      item.scripts ?? "",
      item.pattern,
      (item.runAt as 0 | 1 | 2) ?? 1,
      item.name
    );
    count++;
  }
  return count;
}

export function Automations() {
  const [list, setList] = useState<IAutomation[]>([]);
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            icon={<DownloadOutlined translate="no" />}
            onClick={() => exportAll(list)}
            disabled={list.length === 0}
          >
            {t("export_all_automations")}
          </Button>
          <Upload
            accept=".json,application/json"
            showUploadList={false}
            beforeUpload={(file) => {
              importFromFile(file)
                .then((count) => {
                  fetchList().then(setList);
                  noticeBg({ action: PAGE_ACTIONS.REFRESH_AUTOMATIONS });
                  message.success(chrome.i18n.getMessage("import_automations_success", [String(count)]));
                })
                .catch(() => {
                  message.error(t("import_automations_failed"));
                });
              return false;
            }}
          >
            <Button icon={<UploadOutlined translate="no" />}>
              {t("import_automations")}
            </Button>
          </Upload>
        </div>
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
          width="80px"
          render={(text, record) => (
            <OpBtns onDeleted={onDeleted} record={record} exportOne={exportOne} />
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

function OpBtns(props: {
  onDeleted: () => void;
  record: IAutomation;
  exportOne: (record: IAutomation) => void;
}) {
  return (
    <div className="op-btns" style={{ minWidth: "120px", display: "flex", gap: 8, alignItems: "center" }}>
      <span
        onClick={() => props.exportOne(props.record)}
        style={{ cursor: "pointer" }}
        title={t("export_automation")}
      >
        <DownloadOutlined translate="no" />
      </span>
      <DeleteBtn onDeleted={props.onDeleted} record={props.record} />
    </div>
  );
}

function DeleteBtn(props: { record: IAutomation; onDeleted: () => void }) {
  const onClick = () => {
    automationsController.deleteItem(props.record.id).then(() => {
      props.onDeleted();
      noticeBg({
        action: PAGE_ACTIONS.REFRESH_AUTOMATIONS,
      });
      noticeBg({
        action: APP_ACTIONS.AUTOMATION_UPDATED,
        data: {
          type: "delete",
          old: props.record,
        },
      });
    });
  };

  return (
    <span onClick={onClick}>
      <DeleteOutlined translate="no" />
    </span>
  );
}
