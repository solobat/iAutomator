import CssBaseline from "@mui/material/CssBaseline";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { ThemeProvider } from "@mui/material/styles";
import Export from "./components/Export";
import "./Options.scss";
import { t } from "@src/helper/i18n.helper";
import { Notes } from "./components/Notes";
import { ExtLibs } from "chrome-extension-libs";
import { ExtlibsContextProvider } from "@src/context/ExtlibsContext";
import { Automations } from "./components/Automations";
import { Templates } from "./components/Templates";
import { MessageProvider } from "@src/helper/message";
import { buildTheme } from "@src/helper/theme";
import { ThemeContext } from "@src/context/ThemeContext";
import React, { ReactNode } from "react";
import { Settings } from "./components/Settings";

function TabPanel(props: { active: boolean; children: ReactNode }) {
  if (!props.active) {
    return null;
  }
  return <div>{props.children}</div>;
}

export function Options(props: { libs: ExtLibs }) {
  const { mode } = React.useContext(ThemeContext);
  const theme = React.useMemo(() => buildTheme(mode), [mode]);
  const [tabKey, setTabKey] = React.useState("1");

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ExtlibsContextProvider libs={props.libs}>
        <MessageProvider>
          <div className={`container theme-${mode}`}>
            <Tabs value={tabKey} onChange={(_, value) => setTabKey(value)}>
              <Tab label={t("settings_notion_basic")} value="1" />
              <Tab label={t("settings_notion_export")} value="2" />
              <Tab label={t("settings_notion_note")} value="3" />
              <Tab label={t("templates")} value="4" />
            </Tabs>
            <TabPanel active={tabKey === "1"}>
              <Settings />
            </TabPanel>
            <TabPanel active={tabKey === "2"}>
              <Automations />
              <Export />
            </TabPanel>
            <TabPanel active={tabKey === "3"}>
              <Notes />
            </TabPanel>
            <TabPanel active={tabKey === "4"}>
              <Templates onInstalled={() => setTabKey("2")} />
            </TabPanel>
          </div>
        </MessageProvider>
      </ExtlibsContextProvider>
    </ThemeProvider>
  );
}
