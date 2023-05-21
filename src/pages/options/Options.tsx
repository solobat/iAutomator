import Tabs from "antd/es/tabs";
import Export from "./components/Export";
import "./Options.scss";
import { t } from "@src/helper/i18n.helper";
import { Notes } from "./components/Notes";
import { ExtLibs } from "chrome-extension-libs";
import { ExtlibsContextProvider } from "@src/context/ExtlibsContext";
import { Automations } from "./components/Automations";
import { ConfigProvider, theme } from "antd";

const { TabPane } = Tabs;

export function Options(props: { libs: ExtLibs }) {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
      }}
    >
      <ExtlibsContextProvider libs={props.libs}>
        <div className="container">
          <Tabs defaultActiveKey="1">
            <TabPane tab={t("settings_notion_export")} key="1">
              <Automations />
              <Export />
            </TabPane>
            <TabPane tab={t("settings_notion_note")} key="2">
              <Notes />
            </TabPane>
            <TabPane tab={t("settings_notion_basic")} key="3">
              Settings
            </TabPane>
          </Tabs>
        </div>
      </ExtlibsContextProvider>
    </ConfigProvider>
  );
}
