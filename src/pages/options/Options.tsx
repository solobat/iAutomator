import * as React from "react";
import { useCallback } from "react";
import Tabs from "antd/es/tabs";
import Export from "./components/Export";
import "./Options.scss";
import { t } from "@src/helper/i18n.helper";
import { Notes } from "./components/Notes";
import { ExtLibs } from "chrome-extension-libs";
import { ExtlibsContextProvider } from "@src/context/ExtlibsContext";
import WebDav from "./components/WebDav";
import { Automations } from "./components/Automations";

const { TabPane } = Tabs;

export function Options(props: { libs: ExtLibs }) {
  const onTabChange = useCallback(() => {
    console.log("tab changed...");
  }, []);

  return (
    <ExtlibsContextProvider libs={props.libs}>
      <div className="container">
        <Tabs defaultActiveKey="1" onChange={onTabChange}>
          <TabPane tab={t("settings_notion_note")} key="1">
            <Notes />
          </TabPane>
          <TabPane tab={t("settings_notion_export")} key="2">
            <Automations />
            <Export />
          </TabPane>
          <TabPane tab="WebDav" key="3">
            <WebDav />
          </TabPane>
          <TabPane tab={t("settings_notion_basic")} key="4">
            Settings
          </TabPane>
        </Tabs>
      </div>
    </ExtlibsContextProvider>
  );
}
