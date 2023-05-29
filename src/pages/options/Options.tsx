import Tabs from "antd/es/tabs";
import Export from "./components/Export";
import "./Options.scss";
import { t } from "@src/helper/i18n.helper";
import { Notes } from "./components/Notes";
import { ExtLibs } from "chrome-extension-libs";
import { ExtlibsContextProvider } from "@src/context/ExtlibsContext";
import { Automations } from "./components/Automations";
import { ConfigProvider, theme } from "antd";
import { ThemeContext } from "@src/context/ThemeContext";
import React from "react";
import { Settings } from "./components/Settings";

const { TabPane } = Tabs;

export function Options(props: { libs: ExtLibs }) {
  const { mode } = React.useContext(ThemeContext);

  return (
    <ConfigProvider
      theme={{
        algorithm:
          mode === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <ExtlibsContextProvider libs={props.libs}>
        <div className={`container theme-${mode}`}>
          <Tabs defaultActiveKey="1">
            <TabPane tab={t("settings_notion_basic")} key="1">
              <Settings />
            </TabPane>
            <TabPane tab={t("settings_notion_export")} key="2">
              <Automations />
              <Export />
            </TabPane>
            <TabPane tab={t("settings_notion_note")} key="3">
              <Notes />
            </TabPane>
          </Tabs>
        </div>
      </ExtlibsContextProvider>
    </ConfigProvider>
  );
}
