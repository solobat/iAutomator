import * as React from "react";
import { useCallback } from "react";
import Tabs from "antd/es/tabs";
import Export from "./components/Export";
import "./Options.scss";
import { t } from "@src/helper/i18n.helper";
import { Notes } from "./components/Notes";

const { TabPane } = Tabs;

export function Options() {
  const onTabChange = useCallback(() => {
    console.log("tab changed...");
  }, []);

  return (
    <div className="container">
      <Tabs defaultActiveKey="1" onChange={onTabChange}>
        <TabPane tab={t("settings_notion_note")} key="1">
          <Notes />
        </TabPane>
        <TabPane tab={t("settings_notion_export")} key="2">
          <Export />
        </TabPane>
        <TabPane tab={t("settings_notion_basic")} key="3">
          Settings
        </TabPane>
      </Tabs>
    </div>
  );
}
