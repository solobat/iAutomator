import "./Popup.scss";

import Tabs from "antd/es/tabs";
import * as React from "react";
import { useEffect, useReducer } from "react";

import { t } from "@src/helper/i18n.helper";

import { TabMeta } from "../../common/types";
import { onDbUpdate } from "../../helper/db.helper";
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

export default function Page(props) {
  const [state, dispatch] = useReducer(pageReducer, getInitialState());

  useEffect(() => {
    getTabs((result) => {
      dispatch({ type: ACTIONS.TAB_META, payload: result });
    });
    const unbindFns = onDbUpdate(() => {
      console.log("db updated..");
    });

    return () => {
      unbindFns.then((fns) => fns.forEach((fn) => fn()));
    };
  }, []);

  return (
    <PageContext.Provider value={{ state, dispatch }}>
      <Popup />
    </PageContext.Provider>
  );
}

function Popup() {
  const { state } = useModel();

  return (
    <div className="popupContainer">
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

  return (
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
  );
}
