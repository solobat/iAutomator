import "./Popup.scss";

import Tabs from "antd/es/tabs";
import * as React from "react";
import { useEffect, useReducer } from "react";

import { t } from "@src/helper/i18n.helper";

import { TabMeta } from "../../common/types";
import { getTabs } from "../../helper/tab";
import {
  ACTIONS,
  getInitialState,
  PageContext,
  pageReducer,
  useModel,
} from "../../store/modules/popup.store";
import { AutomationsPanel } from "./components/Automation";
import { Records } from "./components/Record";
import { ShortcutsPanel } from "./components/Shortcut";
import { Help } from "./components/Help";
import { ConfigProvider, theme } from "antd";
import ThemeContextProvider, { ThemeContext } from "@src/context/ThemeContext";

export default function Page(props) {
  const [state, dispatch] = useReducer(pageReducer, getInitialState());

  useEffect(() => {
    getTabs((result) => {
      dispatch({ type: ACTIONS.TAB_META, payload: result });
    });
  }, []);

  return (
    <PageContext.Provider value={{ state, dispatch }}>
      <ThemeContextProvider>
        <Popup />
      </ThemeContextProvider>
    </PageContext.Provider>
  );
}

function Popup() {
  const { state } = useModel();
  const { mode } = React.useContext(ThemeContext);

  return (
    <div className={`popupContainer theme-${mode}`}>
      {state.tab ? <TabInfo tab={state.tab} /> : null}
    </div>
  );
}

interface TabInfoProps {
  tab: TabMeta;
}

const { TabPane } = Tabs;
function TabInfo(props: TabInfoProps) {
  const { host } = props.tab;
  const { dispatch, state } = useModel();
  const { mode } = React.useContext(ThemeContext);

  return (
    <ConfigProvider
      theme={{
        algorithm:
          mode === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}
    >
      <div className="tab-info">
        <Tabs
          activeKey={state.tabKey}
          onChange={(activeKey) =>
            dispatch({ type: ACTIONS.TAB_CHANGE, payload: activeKey })
          }
        >
          <TabPane tab={t("automations")} key="automation">
            <AutomationsPanel />
          </TabPane>
          <TabPane tab={t("records")} key="records">
            <Records host={host} />
          </TabPane>
          <TabPane tab={t("shortcuts")} key="shortcuts">
            <ShortcutsPanel />
          </TabPane>
          <TabPane tab={t("help")} key="help">
            <Help />
          </TabPane>
        </Tabs>
      </div>
    </ConfigProvider>
  );
}
